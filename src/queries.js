const {
    getBit, parseBitmap, onesComplement, getValFromHex
} = require('./helpers')

function getVoltage(context) {
    const res = context.sendCommand('D');
    context.data = {
        ...context.data,
        acVoltage: getValFromHex(res, 1, 2),
        dcVoltage: +(getValFromHex(res, 3, 2) * .1).toFixed(2),
    }
    return context;
}
module.exports.getVoltage = getVoltage;


function getPowerRating(context) {
    const res = context.sendCommand('P');
    context.data.powerRating = Number(res.slice(1, 6).map(val => String.fromCharCode(val)).join(''));
    return context;
}
module.exports.getPowerRating = getPowerRating;


function getRelayStatus(context) {
    const res = context.sendCommand('R');
    let relaysPowered = [];
    for (let i = 0; i < context.data.switchableLoads; i++) {
        relaysPowered.push(getBit(res[2], i));
    }

    context.data = {
        ...context.data,
        masterRelayPowered: !!res[1],
        relaysPowered
    }
    return context
}
module.exports.getRelayStatus = getRelayStatus;


// Protocol ID = [0x30, 0x03]
function isProtocolIdValid(context) {
    const res = context.sendCommand([0x00]);
    return res[1] === 0x30 && res[2] === 0x03;
}
module.exports.isProtocolIdValid = isProtocolIdValid;


function getVoltageRange(context) {
    const res = context.sendCommand('M');
    const multiplier = context.data.nominalVac > 120 ? 1.917 : 1
    context.data = {
        ...context.data,
        acVoltageMin: +(getValFromHex(res, 1, 2) * multiplier).toFixed(2),
        acVoltageMax: +(getValFromHex(res, 3, 2) * multiplier).toFixed(2)
    }
    return context;
}
module.exports.getVoltageRange = getVoltageRange;


function getLoadInfo(context) {
    const res = context.sendCommand('L');
    context.data = {
        ...context.data,
        loadLevel: getValFromHex(res, 1, 2),
        batteryCharge: getValFromHex(res, 3, 2),
        ...parseBitmap(res[5], [
            'autostartAfterShutdown',
            'autostartAfterDelayedWakeup',
            'autostartAfterLowVoltageCutoff',
            'autostartAfterOverload',
            'autostartAfterOverTemp',
            'enableBiweeklyAutoSelfTest'

        ]),
    }
    return context;
}
module.exports.getLoadInfo = getLoadInfo;

function getFirmwareVersion(context) {
    const res = context.sendCommand('F');
    const buf = new Buffer.from(res);
    const partNo = buf.toString('utf8', 1, 5);
    const rev = buf.toString('utf8', 6, 7).trim();
    context.data.firmware = `${partNo} Rev ${rev}`;
    return context
}
module.exports.getFirmwareVersion = getFirmwareVersion;


function getUsbFirmwareVersion(context) {
    const res = context.sendCommand('0');
    const buf = new Buffer.from(res);
    const partNo = buf.toString('utf8', 1, 5);
    const rev = buf.toString('utf8', 6, 7).trim();
    context.data.usbFirmware = `${partNo} Rev ${rev}`;
    return context
}
module.exports.getUsbFirmwareVersion = getUsbFirmwareVersion;



function getBatteryStatus(context) {
    const res = context.sendCommand('S');
    const selfTestModes = [
        'ok', 'batteryFailure', 'inProgress', 'overCurrent', 'unknown', 'batteryFailureAndOverCurrent'
    ]
    const faultModes = ['noFault', 'epoFault', 'otpFault', 'epoAndOtpFault'];
    const tapModes = ['normal', 'cut1', 'boost1', 'boost2', 'cut2'];

    context.data = {
        ...context.data,
        batteryLow: res[1] === '1',
        selfTestState: selfTestModes[parseInt(String.fromCharCode(res[2]))],
        faults: faultModes[parseInt(String.fromCharCode(res[3]))],
        ...parseBitmap(res[4], ['inverterOn', 'selfTestRunning', 'standby', 'idle']),
        batteryCapacityPercentage: res[5],
        transformerTap: tapModes[(String.fromCharCode(res[6]))]
    }
    return context;
}
module.exports.getBatteryStatus = getBatteryStatus;


function getProductName(context) {
    const nameBytes = new Array(5).fill(0).reduce((acc, _, index) => {
        const bytes = context.sendCommand([0x32 + index]).slice(1, -1);
        return [...acc, ...bytes]
    }, []).slice(0, -2);
    context.data.productName = new Buffer.from(nameBytes).toString().trim();
    return context
}
module.exports.getProductName = getProductName;


function getEnvironmental(context) {
    const res = context.sendCommand('T');
    context.data = {
        ...context.data,
        temperature: getValFromHex(res, 1, 2),
        frequency: +(getValFromHex(res, 3, 3) * .1).toFixed(2),
        frequencyMode: getValFromHex(res, 6, 1) ? 60 : 50
    }
    return context;
}
module.exports.getEnvironmental = getEnvironmental;


function getModelVersion(context) {
    const res = context.sendCommand('V');
    context.data = {
        ...context.data,
        nominalVac: [100, 120, 230, 208, 240][getValFromHex(res, 1, 1)],
        nominalVdc: getValFromHex(res, 2, 2) * 6,
        switchableLoads: getValFromHex(res, 4, 1)
    }
    return context;
}
module.exports.getModelVersion = getModelVersion;


function getUnitId(context) {
    const res = context.sendCommand('U');
    context.data.unitId = new Buffer.from(res).readUInt16BE(1)
    return context;
}
module.exports.getUnitId = getUnitId;


function getWatchdogSettings(context) {
    const res = context.sendCommand('W', [0x01]);

    context.data.watchdogEnabled = res[1] > 1;
    context.data.watchdogDelay = res[1]
    return context;
}
module.exports.getWatchdogSettings = getWatchdogSettings;
