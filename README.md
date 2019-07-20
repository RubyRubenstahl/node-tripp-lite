<h1 align="center">Welcome to node-tripp-lite 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
</p>

> `node-tripp-lite` allows you to minitor and controls Tripp-Lite UPSs via USB. It uses the `node-hid` library for communications and is compatible with both Windows and Linux nodejs versions. 

## Install

```sh
npm install node-tripp-lite
```

## Usage

```js
const UPS = require('node-tripp-lite');
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

// Turn on master relay
ups.masterRelayOn()

// Power cycle relay 1 with a 60 second wait time
ups.powerCycleRelay(1, 60000)
```


## Author

👤 **Ruby Rubenstahl**

* Github: [@rubyrubenstahl](https://github.com/rubyrubenstahl)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/RubyRubenstahl/node-tripp-lite/issues).

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_