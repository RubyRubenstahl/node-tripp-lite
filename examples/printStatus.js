const UPS = require('../src/index');

const ups = new UPS();
console.log(ups.getStatus())

/*
Example output:
{
  nominalVac: 120,
  nominalVdc: 24,
  switchableLoads: 2,
  acVoltage: 115,
  dcVoltage: 13.6,
  acVoltageMin: 113,
  acVoltageMax: 117,
  powerRating: 1000,
  masterRelayPowered: true,
  relaysPowered: [ true, true ],
  batteryLow: false,
  selfTestState: 'ok',
  faults: 'noFault',
  inverterOn: false,
  selfTestRunning: false,
  standby: false,
  idle: false,
  batteryCapacityPercentage: 100,
  transformerTap: 'normal',
  productName: 'TRIPP LITE SMART1000RM1U',
  temperature: 132,
  frequency: 60,
  frequencyMode: 60,
  firmware: '2602 Rev A',
  usbFirmware: '1075 Rev A',
  unitId: 42,
  watchdogEnabled: false,
  watchdogDelay: 0,
  loadLevel: 1,
  batteryCharge: 13,
  autostartAfterShutdown: false,
  autostartAfterDelayedWakeup: true,
  autostartAfterLvc: false,
  autostartAfterOverload: false,
  autostartAfterOverTemp: true,
  enableBiweeklyAutoSelfTest: false
}

*/