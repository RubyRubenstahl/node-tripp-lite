const hid = require('node-hid');
const handleIncoming = require('./handleIncoming')
const sortObject = require('sort-object')

const trippLiteVendorId = 0x09AE;

const { onesComplement } = require('./helpers')

function UPS(productId) {
    this.state = {
    }
    this.pollOpcodes = 'VDFLMPRSTUW012345';
    this.receivedOpcodes = [];
    this.initialized = false;
    this.deviceNameParts = new Array(5);


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
    this.device.on('data', data => this._handleIncomingData(data));

    this._handleIncomingData = function _handleIncomingData(packet) {
        const newState = handleIncoming({ data: this.state, packet, nameParts: this.deviceNameParts })
        newState.deviceName = this.deviceNameParts.join('')
        this.state = sortObject(newState);

        this.registerReceivedOpcode(packet);
    }

    /**
     * Keeps a list of recieved opcodes to determine
     *   When we've received all neccessary data to
     *   provide full state to getStatus function
     * @param {array} - Incoming packet from the UPS. An array of bytes
     */
    this.registerReceivedOpcode = function (packet) {
        const opcode = String.fromCharCode(packet[0]);
        if (!this.receivedOpcodes.includes(opcode)) {
            this.receivedOpcodes.push(opcode);
        }

        let allOpcodesReceived = true;
        this.pollOpcodes.split('').forEach(opcode => {
            if (!this.receivedOpcodes.includes(opcode)) {
                allOpcodesReceived = false;
            }
        });
        if (allOpcodesReceived) {
            this.initialized = true;
        }
    }

    // Pack and send a command to the 
    this._sendCommand = function _sendCommand(command, params = []) {
        if (typeof command === 'string') {
            command = [command.charCodeAt(0)]
        }
        const commandBytes = [...command, ...params];
        const checksum = onesComplement(commandBytes)
        this.device.write([0x00, 0x3A, ...commandBytes, checksum, 0x0D]);
    }



    /**
     * 
     */
    this.writeSettings = function writeSettings(flags = {}) {
        const currentState = getLoadInfo({ data: {}, sendCommand: (...args) => this._sendCommand(...args) }).data;
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
        this._sendCommand('I', [flagMask])
        return this;
    }

    /**
     * Resets the min and max voltage registers
     */
    this.resetVoltageRange = function resetVoltageRange() {
        this._sendCommand('Z')
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
        this._sendCommand('A');
        return this;
    }

    /**
     * Reboot the UPS
     */
    this.reboot = function () {
        this._sendCommand('Q');
        return this;
    }

    /**
     * Write the unit ID to the UPS
     * @param {number} unitId - 16bit unit number
     */
    this.writeUnitId = function writeUnitId(unitId) {
        const buf = new Buffer.alloc(2)
        buf.writeUInt16BE(unitId, 0);
        this._sendCommand('J', [...buf.values()]);
        return this;
    }

    /**
     * Write the pre-delay (used before shutdown and relay control functions)
     * @param {number} delayTime - delay time in seconds
     */
    this.writePreDelay = function writePreDelay(delayTime) {
        const buf = new Buffer.alloc(2)
        buf.writeUInt16BE(delayTime, 0);
        this._sendCommand('N', [...buf.values()]);
        return this;
    }

    /**
     * Turns a relay on
     * @param {number} relay - relay index (0=master)
     */
    this.relayOn = function relayOn(relay = 0) {
        const relayId = 0x30 + relay;
        this._sendCommand('K', [relayId, '1'.charCodeAt(0)]);
        return this;
    }

    /**
     * Turns a relay off
     * @param {number} relay - relay index (0=master)
     */
    this.relayOff = function relayOff(relay = 0) {
        const relayId = 0x30 + relay;
        this._sendCommand('K', [relayId, '0'.charCodeAt(0)]);
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
        this._sendCommand('W', [0]);
        return this;
    }

    /**
     * Enables the watchdog feature
     * @param {number} delay - Delay time in seconds (must be >1);
     */
    this.enableWatchdog = function enableWatchdog(delay = 60) {
        const buf = new Buffer.alloc(1);
        buf.writeUInt8(delay, 0)
        this._sendCommand('W', [...buf.values()])
        return this;
    }

    this._startPolling = function _startPolling() {
        let currentIndex = 0;
        setInterval(() => {
            const opcode = this.pollOpcodes[currentIndex]
            this._sendCommand(opcode, opcode === 'W' ? [1] : []);
            if (++currentIndex >= this.pollOpcodes.length) {
                currentIndex = 0;
            }
        }, 100)
    }

    // Return state immediately if initialized,
    // Check every 100ms until initialization is
    // complete otherwise.
    this.getStatus = function getStatus() {
        return new Promise((resolve, reject) => {
            if (this.initialized) {
                resolve(this.state);
            }
            const checkInitialization = () => {
                setTimeout(() => {
                    if (this.initialized) {
                        resolve(this.state);
                    }
                    else {
                        checkInitialization();
                    }
                }, 100)
            }
            checkInitialization()
        });
    }

    this._startPolling();

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