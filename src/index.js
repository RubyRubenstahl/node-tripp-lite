const hid = require('node-hid');

const trippLiteVendorId = 0x09AE;

const {
    isProtocolIdValid,
    getVoltage,
    getVoltageRange,
    getPowerRating,
    getRelayStatus,
    getBatteryStatus,
    getProductName,
    getModelVersion,
    getEnvironmental,
    getFirmwareVersion,
    getUsbFirmwareVersion,
    getUnitId,
    getWatchdogSettings,
    getLoadInfo
} = require('./queries')

const { onesComplement } = require('./helpers')

function UPS(productId) {

    const devices = hid.devices();
    this.deviceDescriptor = productId ?
        devices.find(device => device.vendorId === trippLiteVendorId && device.productId === productId) :
        devices.find(device => device.vendorId === trippLiteVendorId);

    if (!this.deviceDescriptor) {
        if (productId) {
            throw new Error(`No Tripp Lite UPS with a product id of "${productId}" found`);
        }
        else {
            throw new Error(`No Tripp Lite UPS found`);
        }
    }

    this.device = new hid.HID(this.deviceDescriptor.path);

    this.device.on('error', err => console.error(err.message))

    // Send incoming data to dummy function
    this.device.on('data', () => { });



    this.sendCommand = function sendCommand(command, params = []) {
        if (typeof command === 'string') {
            command = [command.charCodeAt(0)]
        }
        const commandBytes = [...command, ...params];
        const checksum = onesComplement(commandBytes)
        const bytes = this.device.write([0x00, 0x3A, ...commandBytes, checksum, 0x0D]);
        const res = this.device.readSync();
        if (res[0] !== commandBytes[0]) {
            throw new Error('Invalid USB Response');
        } else {
            return res
        }
    }

    /**
     * Returns the status object for the UPS
     * @returns statusObj
     */
    this.getStatus = function getStatus() {
        const context = {
            sendCommand: (...args) => this.sendCommand(...args),
            data: {},
        }

        if (!isProtocolIdValid(context)) {
            throw new Error('This devices is not supported')
        }

        const queries = [
            getModelVersion,
            getVoltage,
            getVoltageRange,
            getPowerRating,
            getRelayStatus,
            getBatteryStatus,
            getProductName,
            getEnvironmental,
            getFirmwareVersion,
            getUsbFirmwareVersion,
            getUnitId,
            getWatchdogSettings,
            getLoadInfo
        ]

        const result = queries.reduce((context, fn) => {
            return fn(context);
        }, context);

        return result.data
    }

    /**
     * 
     */
    this.setNvrFlags = function setNvrFlags(flags = {}) {
        const currentState = getLoadInfo({ data: {}, sendCommand: (...args) => this.sendCommand(...args) }).data;
        const newState = { ...currentState, ...flags };
        const newBitStr = [
            newState.autostartAfterShutdown,
            newState.autostartAfterDelayedWakeup,
            newState.autostartAfterLowVoltageCutoff,
            newState.autostartAfterOverload,
            newState.autostartAfterOverTemp,
            newState.enableBiweeklyAutoSelfTest,
        ].map(val => Number(val)).join('');
        const flagMask = parseInt(newBitStr, 2);
        this.sendCommand('I', [flagMask])
        return this;
    }

    /**
     * Resets the min and max voltage registers
     */
    this.resetVoltageRange = function resetVoltageRange() {
        this.sendCommand('Z')
    }


    /**
     * Power cycle a specific relay on the ups
     * @param {number} relay - Relay index (0=master)
     * @param {number} delayTime - Delay time in ms before turning power back on
     */
    this.powerCycleRelay = function powerCycle(relay, delayTime = 30000) {
        this.relayOff(relay);
        setTimeout(async () => this.relayOn(relay), delayTime);
    }

    /**
     * Power cycle the master relay
     * @param {number} delayTime - Delay time in ms before turning power back on
     */
    this.powerCycleMasterRelay = function powerCycleMasterRelay(delayTime = 30000) {
        this.relayOff(0);
        setTimeout(async () => this.relayOn(0), delayTime);
    }

    /**
     * Trigger a self-test
     */
    this.selfTest = function () {
        this.sendCommand('A');
        return this;
    }

    /**
     * Reboot the UPS
     */
    this.reboot = function () {
        this.sendCommand('Q');
        return this;
    }

    /**
     * Write the unit ID to the UPS
     * @param {number} unitId - 16bit unit number
     */
    this.writeUnitId = function (unitId) {
        const buf = new Buffer.alloc(2)
        buf.writeUInt16BE(unitId, 0);
        this.sendCommand('J', [...buf.values()]);
        return this;
    }

    /**
     * Write the pre-delay (used before shutdown and relay control functions)
     * @param {number} delayTime - delay time in seconds
     */
    this.writePreDelay = function (delayTime) {
        const buf = new Buffer.alloc(2)
        buf.writeUInt16BE(delayTime, 0);
        this.sendCommand('N', [...buf.values()]);
        return this;
    }

    /**
     * Turns a relay on
     * @param {number} relay - relay index (0=master)
     */
    this.relayOn = function relayOn(relay = 0) {
        const relayId = 0x30 + relay;
        this.sendCommand('K', [relayId, '1'.charCodeAt(0)]);
        return this;
    }

    /**
     * Turns a relay off
     * @param {number} relay - relay index (0=master)
     */
    this.relayOff = function relayOff(relay = 0) {
        const relayId = 0x30 + relay;
        this.sendCommand('K', [relayId, '0'.charCodeAt(0)]);
        return this;
    }

    /**
     * Turns master relay on
     */
    this.masterRelayOn = function () {
        this.relayOn(0);
        return this;
    }

    /**
     * Turns master relay off
     */
    this.masterRelayOff = function () {
        this.relayOff(0);
        return this;
    }

    /**
     * Disables the watchdog feature
     */
    this.disableWatchdog = function disableWatchdog() {
        this.sendCommand('W', [0]);
        return this;
    }

    /**
     * Enables the watchdog feature
     * @param {number} delay - Delay time in seconds (must be >1);
     */
    this.enableWatchdog = function enableWatchdog(delay = 60) {
        const buf = new Buffer.alloc(1);
        buf.writeUInt8(delay, 0)
        this.sendCommand('W', [...buf.values()])
        return this;
    }

}

/**
 * Get a list of tripp-lite UPSs connected
 * @returns {array} - Array of available devices
 */
UPS.list = function () {
    const devices = hid.devices();
    const list = devices.filter(device => device.vendorId === trippLiteVendorId);
    return list;
}


module.exports = UPS;