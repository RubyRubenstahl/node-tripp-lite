
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const hid = require('node-hid');
const deepEqual = require('fast-deep-equal');
const sortObject = require('sort-object')
const { onesComplement } = require('./helpers')

const trippLiteVendorId = 0x09AE;

/** 
 * @constructor
 * @typicalName ups
 * */
function UPS(productId) {
    this.state = {}

    // List of opcodes that will be polled 
    this.pollOpcodes = 'VDFLMPRSTUW012345';

    // A list of unique op codes that have been received.
    // When all of the op poll opcodes have been received,
    // the initialized flag will be set to true. 
    this.receivedOpcodes = [];

    // Determines when the getStatus function will be
    // allowed to return the state (after all pollOpcodes
    // have been recieved at least once)
    this.initialized = false;

    // The device name is broken into chunks, requested
    // by multiple opcodes (2-5). This will hold the
    // chunks to be joined to create the full name
    this.deviceNameParts = new Array(5);

    // If a product ID is not specified, the first found device is used. 
    this._initDevice = function _initDevice(productId) {
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
    }


    this._handleIncomingData = function _handleIncomingData(packet) {
        const newState = handleIncoming({ data: this.state, packet, nameParts: this.deviceNameParts })
        newState.deviceName = this.deviceNameParts.join('')
        this._setState(newState);
        this._registerReceivedOpcode(packet);
    }

    /**
     * Keeps a list of recieved opcodes to determine
     *   When we've received all neccessary data to
     *   provide full state to getStatus function
     * @access private
     * @param {array} packet - Incoming packet from the UPS. An array of bytes.
     */
    this._registerReceivedOpcode = function _registerReceivedOpcode(packet) {
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

    /**
     * Pack and send a command to the UPS
     * @access private
     * @param {string} opcode - single character opcode
     * @param {array} params - array of bytes representing the command parameters. 
     */
    this._sendCommand = function _sendCommand(opcode, params = []) {
        if (typeof opcode === 'string') {
            opcode = [opcode.charCodeAt(0)]
        }
        const commandBytes = [...opcode, ...params];
        const checksum = onesComplement(commandBytes)
        this.device.write([0x00, 0x3A, ...commandBytes, checksum, 0x0D]);
    }

    this._setState = function _setState(newState) {
        this._emitStateChanges(this.state, newState);
        this.state = sortObject(newState)
    }

    this._emitStateChanges = function _emitStateChanges(oldState, newState) {
        if (!this.initialized) {
            return
        }
        Object.keys(newState).forEach(key => {
            if (!deepEqual(oldState[key], newState[key])) {
                this.emit('change', { property: key, value: newState[key], oldValue: oldState[key] })
            }
        })
    }

    /**
     * @typedef {Object} UPSState
     * @property {boolean} autostartAfterDelayedWakeup
     * @property {boolean} autostartAfterLowVoltageCutoff
     * @property {boolean} autostartAfterOverload
     * @property {boolean} autostartAfterOverTemp
     * @property {boolean} autostartAfterShutdown
     * @property {number} batteryCapacityPercentage Battery capacity in percentage
     * @property {number} batteryCharge
     * @property {boolean} batteryLow
     * @property {string} deviceName Device model name
     * @property {boolean} enableBiweeklyAutoSelfTest
     * @property {string} faults: 'noFault',
     * @property {string} firmware Firmware version
     * @property {number} frequency AC Power frequencey
     * @property {} frequencyMode AC Frequencey mode
     * @property {boolean} idle
     * @property {boolean} inverterOn 
     * @property {number} loadLevel Output load level in percentage
     * @property {array} loadRelaysPowered 
     *                    Array of boolean values indicating the state of the load relays. 
     *                    The number of relays included is determinted by the value of switchableLoads.
     * @property {boolean} masterRelayPowered
     * @property {number} nominalVac Nominal battery Voltage of the device
     * @property {number} nominalVdc Nominal battery voltage of the device
     * @property {number} powerRating Power rating in VA. 
     * @property {boolean} selfTestRunning
     * @property {string} selfTestState Self test state
     * @property {boolean} standby
     * @property {number} switchableLoads number of relays that can be switched, excluding the master. 
     * @property {number} temperature not currently working correctly
     * @property {string} transformerTap Transformer tap state
     * @property {number} unitId
     * @property {string} usbFirmware USB firmware version
     * @property {number} voltageAc Current input AC voltage
     * @property {number} voltageAcMax Hightest detected AC voltage
     * @property {number} voltageAcMin Lowest detected AC voltage
     * @property {number} voltageDc Current DC voltage
     * @property {number} watchdogDelay 
     * @property {boolean} watchdogEnabled
     */

    /**
     * Return state immediately if initialized,
     * Check every 100ms until initialization is
     * complete otherwise.
     * @memberof TrippLite
     * @function getStatus
     * @returns {UPSState} - Object containing the state of the UPS
     **/
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

    /**
     * Write system settings to the UPS. 
     * Any settings not included to will be left the same. 
     * @param {object} flags - An object containing the settings to write. 
     * @param {boolean} flags.autostartAfterShutdown - Automatically restart the system after a shutdown
     * @param {boolean} flags.autostartAfterDelayedWakeup - Automatically restart the system after a delayed wakeup
     * @param {boolean} flags.autostartAfterDelayedWakeup - Automatically restart the system after low voltage cutoff. 
     * @param {boolean} flags.autostartAfterOverload - Automatically restart the system after overload. 
     * @param {boolean} flags.autostartAfterOverTemp - Automatically restart the system after an over temp situation. 
     * @param {boolean} flags.enableBiweeklyAutoSelfTest - Enable 14 day self tests. 
     * @example
     * ups.writeSettings({
     *     autostartAfterShutdown: true
     * })
     */
    this.writeSettings = function writeSettings(flags = {}) {
        const currentState = {
            autostartAfterShutdown: this.state.autostartAfterShutdown,
            autostartAfterDelayedWakeup: this.state.autostartAfterDelayedWakeup,
            autostartAfterLowVoltageCutoff: this.state.autostartAfterLowVoltageCutoff,
            autostartAfterOverload: this.state.autostartAfterOverload,
            autostartAfterOverTemp: this.state.autostartAfterOverTemp,
            enableBiweeklyAutoSelfTest: this.state.enableBiweeklyAutoSelfTest,
        };
        const newState = { ...currentState, ...flags };

        // Convert booleans 10 string of 0's and 1's, then
        // parse the string as binary
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
     * @example
     * ups.resetVoltageRange();
     */
    this.resetVoltageRange = function resetVoltageRange() {
        this._sendCommand('Z')
    }

    /**
     * Power cycle a specific relay on the ups
     * @param {number} relay - Relay index (0=master)
     * @param {number} delayTime - Delay time in ms before turning power back on
     * @example
     * // Power cycle load 1 relay, waiting 20 seconds before restarting
     * ups.powerCycleRelay(1, 20000)
     */
    this.powerCycleRelay = function powerCycle(relay, delayTime = 30000) {
        this.relayOff(relay);
        setTimeout(async () => this.relayOn(relay), delayTime);
    }

    /**
     * Power cycle the master relay
     * @param {number} delayTime - Delay time in ms before turning power back on
     * @example
     * // Power cycle master relay, waiting 60 seconds before restarting
     * ups.powerCycleMasterRelay(60000)
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



    this._initDevice(productId);
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