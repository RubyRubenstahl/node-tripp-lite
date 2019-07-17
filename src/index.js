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

}


UPS.prototype.sendCommand = function sendCommand(command, params = []) {
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

UPS.prototype.getStatus = function getStatus() {
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


UPS.prototype.setNvrFlags = function setNvrFlags(flags = {}) {
    const currentState = getLoadInfo({ data: {}, sendCommand: (...args) => this.sendCommand(...args) }).data;
    const newState = { ...currentState, ...flags };
    const newBitStr = [
        newState.autostartAfterShutdown,
        newState.autostartAfterDelayedWakeup,
        newState.autostartAfterLvc,
        newState.autostartAfterOverload,
        newState.autostartAfterOverTemp,
        newState.enableBiweeklyAutoSelfTest,
    ].map(val => Number(val)).join('');
    const flagMask = parseInt(newBitStr, 2);
    this.sendCommand('I', [flagMask])
    return this;
}

UPS.prototype.powerCycleRelay = function powerCycle(relay, delayTime = 30000) {
    this.relayOff(relay);
    setTimeout(async () => this.relayOn(relay), delayTime);
}

UPS.prototype.powerCycleMasterRelay = function powerCycleMasterRelay(delayTime = 30000) {
    this.relayOff(0);
    setTimeout(async () => this.relayOn(0), delayTime);
}

UPS.prototype.selfTest = function () {
    this.sendCommand('A');
    return this;
}

UPS.prototype.reboot = function () {
    this.sendCommand('Q');
    return this;
}


UPS.prototype.writeUnitId = function (unitId) {
    const buf = new Buffer.alloc(2)
    buf.writeUInt16BE(unitId, 0);
    this.sendCommand('J', [...buf.values()]);
    return this;
}

UPS.prototype.writePreDelay = function (delayTime) {
    const buf = new Buffer.alloc(2)
    buf.writeUInt16BE(delayTime, 0);
    this.sendCommand('N', [...buf.values()]);
    return this;
}

UPS.prototype.masterRelayOn = function () {
    this.relayOn(0);
    return this;
}

UPS.prototype.masterRelayOff = function () {
    this.relayOff(0);
    return this;
}

UPS.prototype.relayOn = function relayOn(relay = 0) {
    const relayId = 0x30 + relay;
    this.sendCommand('K', [relayId, '1'.charCodeAt(0)]);
    return this;
}

UPS.prototype.relayOff = function relayOff(relay = 0) {
    const relayId = 0x30 + relay;
    this.sendCommand('K', [relayId, '0'.charCodeAt(0)]);
    return this;
}

UPS.prototype.disableWatchdog = function disableWatchdog() {


    this.sendCommand('W', [0]);
    return this;
}


UPS.prototype.enableWatchdog = function enableWatchdog(delay = 60) {
    const buf = new Buffer(1);
    buf.writeUInt8(delay, 0)
    this.sendCommand('W', [...buf.values()])
    return this;
}

UPS.list = function () {
    const devices = hid.devices();
    const list = devices.filter(device => device.vendorId === trippLiteVendorId);
    return list;
}

module.exports = UPS;