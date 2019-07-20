<h1 align="center">Welcome to node-tripp-lite 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
</p>

> `node-tripp-lite` allows you to minitor and controls Tripp-Lite UPSs via USB. It uses the `node-hid` library for
communications and is compatible with both Windows and Linux nodejs versions.

## Install

```sh
npm install node-tripp-lite
```

## Usage

```js
const UPS = require('node-tripp-lite');
const ups = new UPS();

// Turn on master relay
ups.masterRelayOn()

// Turn off the load on relay 2
ups.relayOff(2)

// Power cycle relay 1 with a 60 second wait time
ups.powerCycleRelay(1, 60000)

ups.getStatus().then(status => console.log(status))
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
```
### API
## Classes

<dl>
<dt><a href="#UPS">UPS</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UPSState">UPSState</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="UPS"></a>

## UPS
**Kind**: global class  

* [UPS](#UPS)
    * _instance_
        * [.writeSettings(flags)](#UPS+writeSettings)
        * [.resetVoltageRange()](#UPS+resetVoltageRange)
        * [.powerCycleRelay(relay, delayTime)](#UPS+powerCycleRelay)
        * [.powerCycleMasterRelay(delayTime)](#UPS+powerCycleMasterRelay)
        * [.selfTest()](#UPS+selfTest)
        * [.reboot()](#UPS+reboot)
        * [.writeUnitId(unitId)](#UPS+writeUnitId)
        * [.writePreDelay(delayTime)](#UPS+writePreDelay)
        * [.relayOn(relay)](#UPS+relayOn)
        * [.relayOff(relay)](#UPS+relayOff)
        * [.masterRelayOn()](#UPS+masterRelayOn)
        * [.masterRelayOff()](#UPS+masterRelayOff)
        * [.disableWatchdog()](#UPS+disableWatchdog)
        * [.enableWatchdog(delay)](#UPS+enableWatchdog)
    * _static_
        * [.list()](#UPS.list) ⇒ <code>array</code>

<a name="UPS+writeSettings"></a>

### ups.writeSettings(flags)
Write system settings to the UPS. Any settings not included to will be left the same.

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| flags | <code>object</code> | An object containing the settings to write. |
| flags.autostartAfterShutdown | <code>boolean</code> | Automatically restart the system after a shutdown |
| flags.autostartAfterDelayedWakeup | <code>boolean</code> | Automatically restart the system after a delayed wakeup |
| flags.autostartAfterDelayedWakeup | <code>boolean</code> | Automatically restart the system after low voltage cutoff. |
| flags.autostartAfterOverload | <code>boolean</code> | Automatically restart the system after overload. |
| flags.autostartAfterOverTemp | <code>boolean</code> | Automatically restart the system after an over temp situation. |
| flags.enableBiweeklyAutoSelfTest | <code>boolean</code> | Enable 14 day self tests. |

<a name="UPS+resetVoltageRange"></a>

### ups.resetVoltageRange()
Resets the min and max voltage registers

**Kind**: instance method of [<code>UPS</code>](#UPS)  
<a name="UPS+powerCycleRelay"></a>

### ups.powerCycleRelay(relay, delayTime)
Power cycle a specific relay on the ups

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| relay | <code>number</code> | Relay index (0=master) |
| delayTime | <code>number</code> | Delay time in ms before turning power back on |

<a name="UPS+powerCycleMasterRelay"></a>

### ups.powerCycleMasterRelay(delayTime)
Power cycle the master relay

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| delayTime | <code>number</code> | Delay time in ms before turning power back on |

<a name="UPS+selfTest"></a>

### ups.selfTest()
Trigger a self-test

**Kind**: instance method of [<code>UPS</code>](#UPS)  
<a name="UPS+reboot"></a>

### ups.reboot()
Reboot the UPS

**Kind**: instance method of [<code>UPS</code>](#UPS)  
<a name="UPS+writeUnitId"></a>

### ups.writeUnitId(unitId)
Write the unit ID to the UPS

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| unitId | <code>number</code> | 16bit unit number |

<a name="UPS+writePreDelay"></a>

### ups.writePreDelay(delayTime)
Write the pre-delay (used before shutdown and relay control functions)

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| delayTime | <code>number</code> | delay time in seconds |

<a name="UPS+relayOn"></a>

### ups.relayOn(relay)
Turns a relay on

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| relay | <code>number</code> | relay index (0=master) |

<a name="UPS+relayOff"></a>

### ups.relayOff(relay)
Turns a relay off

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| relay | <code>number</code> | relay index (0=master) |

<a name="UPS+masterRelayOn"></a>

### ups.masterRelayOn()
Turns master relay on

**Kind**: instance method of [<code>UPS</code>](#UPS)  
<a name="UPS+masterRelayOff"></a>

### ups.masterRelayOff()
Turns master relay off

**Kind**: instance method of [<code>UPS</code>](#UPS)  
<a name="UPS+disableWatchdog"></a>

### ups.disableWatchdog()
Disables the watchdog feature

**Kind**: instance method of [<code>UPS</code>](#UPS)  
<a name="UPS+enableWatchdog"></a>

### ups.enableWatchdog(delay)
Enables the watchdog feature

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | Delay time in seconds (must be >1); |

<a name="UPS.list"></a>

### UPS.list() ⇒ <code>array</code>
Get a list of tripp-lite UPSs connected

**Kind**: static method of [<code>UPS</code>](#UPS)  
**Returns**: <code>array</code> - - Array of available devices  
<a name="UPSState"></a>

## UPSState : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| autostartAfterDelayedWakeup | <code>boolean</code> |  |
| autostartAfterLowVoltageCutoff | <code>boolean</code> |  |
| autostartAfterOverload | <code>boolean</code> |  |
| autostartAfterOverTemp | <code>boolean</code> |  |
| autostartAfterShutdown | <code>boolean</code> |  |
| batteryCapacityPercentage | <code>number</code> | Battery capacity in percentage |
| batteryCharge | <code>number</code> |  |
| batteryLow | <code>boolean</code> |  |
| deviceName | <code>string</code> | Device model name |
| enableBiweeklyAutoSelfTest | <code>boolean</code> |  |
| faults: | <code>string</code> | 'noFault', |
| firmware | <code>string</code> | Firmware version |
| frequency | <code>number</code> | AC Power frequencey |
| frequencyMode |  | AC Frequencey mode |
| idle | <code>boolean</code> |  |
| inverterOn | <code>boolean</code> |  |
| loadLevel | <code>number</code> | Output load level in percentage |
| loadRelaysPowered | <code>array</code> | Array of boolean values indicating the state of the load relays.                     The number of relays included is determinted by the value of switchableLoads. |
| masterRelayPowered | <code>boolean</code> |  |
| nominalVac | <code>number</code> | Nominal battery Voltage of the device |
| nominalVdc | <code>number</code> | Nominal battery voltage of the device |
| powerRating | <code>number</code> | Power rating in VA. |
| selfTestRunning | <code>boolean</code> |  |
| selfTestState | <code>string</code> | Self test state |
| standby | <code>boolean</code> |  |
| switchableLoads | <code>number</code> | number of relays that can be switched, excluding the master. |
| temperature | <code>number</code> | not currently working correctly |
| transformerTap | <code>string</code> | Transformer tap state |
| unitId | <code>number</code> |  |
| usbFirmware | <code>string</code> | USB firmware version |
| voltageAc | <code>number</code> | Current input AC voltage |
| voltageAcMax | <code>number</code> | Hightest detected AC voltage |
| voltageAcMin | <code>number</code> | Lowest detected AC voltage |
| voltageDc | <code>number</code> | Current DC voltage |
| watchdogDelay | <code>number</code> |  |
| watchdogEnabled | <code>boolean</code> |  |


## Author

👤 **Ruby Rubenstahl**

* Github: [@rubyrubenstahl](https://github.com/rubyrubenstahl)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues
page](https://github.com/RubyRubenstahl/node-tripp-lite/issues).

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_