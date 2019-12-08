const UPS = require('../src/index');

const ups = new UPS();
ups.getStatus().then(status => console.log(status)).catch(err=>console.log(err))

/*
Example output:
{
  autostartAfterDelayedWakeup: true,
  autostartAfterLowVoltageCutoff: false,
  autostartAfterOverload: false,
  autostartAfterOverTemp: true,
  autostartAfterShutdown: false,
  batteryCapacityPercentage: 100,
  batteryCharge: 0,
  batteryLow: false,
  deviceName: 'TRIPP LITE SMART1000RM1',
  enableBiweeklyAutoSelfTest: false,
  faults: 'noFault',
  firmware: '2602 Rev A',
  frequency: 59.9,
  frequencyMode: 60,
  idle: false,
  inverterOn: false,
  loadLevel: 1,
  loadRelaysPowered: [ true, true ],
  masterRelayPowered: true,
  nominalVac: 120,
  nominalVdc: 24,
  powerRating: 1000,
  selfTestRunning: false,
  selfTestState: 'ok',
  standby: false,
  switchableLoads: 2,
  temperature: 131,
  transformerTap: 'normal',
  unitId: 42,
  usbFirmware: '1075 Rev A',
  voltageAc: 115,
  voltageAcMax: 117,
  voltageAcMin: 113,
  voltageDc: 13.6,
  watchdogDelay: 0,
  watchdogEnabled: false
}

*/