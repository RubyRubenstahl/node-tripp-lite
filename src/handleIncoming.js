const {
    getBit, parseBitmap, onesComplement, getValFromHex
} = require('./helpers')


const handlers = []

handlers.push({
    opcode: 'M',
    fn: (context) => {
        if (!context.data.nominalVac) {
            return context;
        }
        context.data.nominalVac > 120 ? 1.917 : 1
        const multiplier = 1;
        context.data = {
            ...context.data,
            voltageAcMin: +(getValFromHex(context.packet, 1, 2) * multiplier).toFixed(2),
            voltageAcMax: +(getValFromHex(context.packet, 3, 2) * multiplier).toFixed(2)
        }
        return context;
    }
});

handlers.push({
    opcode: 'F',
    fn: (context) => {
        const buf = new Buffer.from(context.packet);
        const partNo = buf.toString('utf8', 1, 5);
        const rev = buf.toString('utf8', 6, 7).trim();
        context.data.firmware = `${partNo} Rev ${rev}`;
        return context
    }
});

handlers.push({
    opcode: 'P',
    fn: (context) => {
        context.data.powerRating = Number(context.packet.slice(1, 6).map(val => String.fromCharCode(val)).join(''));
        return context;
    }
});

handlers.push({
    opcode: 'D',
    fn: (context) => {
        context.data = {
            ...context.data,
            voltageAc: getValFromHex(context.packet, 1, 2),
            voltageDc: +(getValFromHex(context.packet, 3, 2) * .1).toFixed(2),
        }
        return context;
    }
});

handlers.push({
    opcode: 'P',
    fn: (context) => {
        context.data.powerRating = Number(context.packet.slice(1, 6).map(val => String.fromCharCode(val)).join(''));
        return context;
    }
});

handlers.push({
    opcode: 'R',
    fn: (context) => {
        if (!context.data.switchableLoads) {
            return context
        }
        let loadRelaysPowered = [];
        for (let i = 0; i < context.data.switchableLoads; i++) {
            loadRelaysPowered.push(getBit(context.packet[2], i));
        }

        context.data = {
            ...context.data,
            masterRelayPowered: !!context.packet[1],
            loadRelaysPowered
        }
        return context
    }
});
handlers.push({
    opcode: 'L',
    fn: (context) => {
        context.data = {
            ...context.data,
            loadLevel: getValFromHex(context.packet, 1, 2),
            batteryCharge: getValFromHex(context.packet, 3, 2),
            ...parseBitmap(context.packet[5], [
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
});


handlers.push({
    opcode: '0',
    fn: (context) => {
        const buf = new Buffer.from(context.packet);
        const partNo = buf.toString('utf8', 1, 5);
        const rev = buf.toString('utf8', 6, 7).trim();
        context.data.usbFirmware = `${partNo} Rev ${rev}`;
        return context
    }
});

handlers.push({
    opcode: '0x00',
    fn: (context) => {
        return context.packet[1] === 0x30 && context.packet[2] === 0x03;
    }
});

handlers.push({
    opcode: 'T',
    fn: (context) => {
        context.data = {
            ...context.data,
            temperature: getValFromHex(context.packet, 1, 2),
            frequency: +(getValFromHex(context.packet, 3, 3) * .1).toFixed(2),
            frequencyMode: getValFromHex(context.packet, 6, 1) ? 60 : 50
        }
        return context;
    }
});

handlers.push({
    opcode: 'W',
    fn: (context) => {
        context.data.watchdogEnabled = context.packet[1] > 1;
        context.data.watchdogDelay = context.packet[1]
        return context;
    }
});


handlers.push({
    opcode: '2',
    fn: (context) => {
        const nameBytes = context.packet.slice(1, -1);
        context.nameParts[0] = new Buffer.from(nameBytes).toString();
        return context;
    }
});

handlers.push({
    opcode: '3',
    fn: (context) => {
        const nameBytes = context.packet.slice(1, -1);
        context.nameParts[1] = new Buffer.from(nameBytes).toString();
        return context;
    }
});

handlers.push({
    opcode: '4',
    fn: (context) => {
        const nameBytes = context.packet.slice(1, -1);
        context.nameParts[2] = new Buffer.from(nameBytes).toString();
        return context;
    }
});

handlers.push({
    opcode: '5',
    fn: (context) => {
        const nameBytes = context.packet.slice(1, -2);
        context.nameParts[3] = new Buffer.from(nameBytes).toString();
        return context;
    }
});


handlers.push({
    opcode: 'V',
    fn: (context) => {
        context.data = {
            ...context.data,
            nominalVac: [100, 120, 230, 208, 240][getValFromHex(context.packet, 1, 1)],
            nominalVdc: getValFromHex(context.packet, 2, 2) * 6,
            switchableLoads: getValFromHex(context.packet, 4, 1)
        }
        return context;
    }
});


handlers.push({
    opcode: 'U',
    fn: (context) => {
        context.data.unitId = new Buffer.from(context.packet).readUInt16BE(1)
        return context;
    }
});


handlers.push({
    opcode: 'S',
    fn: (context) => {
        const selfTestModes = [
            'ok', 'batteryFailure', 'inProgress', 'overCurrent', 'unknown', 'batteryFailureAndOverCurrent'
        ]
        const faultModes = ['noFault', 'epoFault', 'otpFault', 'epoAndOtpFault'];
        const tapModes = ['normal', 'cut1', 'boost1', 'boost2', 'cut2'];

        context.data = {
            ...context.data,
            batteryLow: context.packet[1] === '1',
            selfTestState: selfTestModes[parseInt(String.fromCharCode(context.packet[2]))],
            faults: faultModes[parseInt(String.fromCharCode(context.packet[3]))],
            ...parseBitmap(context.packet[4], ['inverterOn', 'selfTestRunning', 'standby', 'idle']),
            batteryCapacityPercentage: context.packet[5],
            transformerTap: tapModes[(String.fromCharCode(context.packet[6]))]
        }
        return context;
    }
});




function createHandler(handlers = []) {
    return function (context) {
        const opcode = String.fromCharCode(context.packet[0])
        const result = handlers.reduce((context, handler) => {
            const isValidHandler = handler.opcode !== '' && opcode === handler.opcode;
            if (isValidHandler) {
                return handler.fn(context)
            } else {
                return context
            }

        }, context);
        return result.data;
    }
}
module.exports = createHandler(handlers);