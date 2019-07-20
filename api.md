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
### API
## Functions

<dl>
<dt><a href="#_registerReceivedOpcode">_registerReceivedOpcode(packet)</a></dt>
<dd><p>Keeps a list of recieved opcodes to determine
  When we&#39;ve received all neccessary data to
  provide full state to getStatus function</p>
</dd>
<dt><a href="#_sendCommand">_sendCommand(opcode, params)</a></dt>
<dd><p>Pack and send a command to the UPS</p>
</dd>
<dt><a href="#getStatus">getStatus()</a> ⇒ <code><a href="#UPSState">UPSState</a></code></dt>
<dd><p>Return state immediately if initialized,
Check every 100ms until initialization is
complete otherwise.</p>
</dd>
<dt><a href="#writeSettings">writeSettings(flags)</a></dt>
<dd><p>Write system settings to the UPS. 
Any settings not included to will be left the same.</p>
</dd>
<dt><a href="#resetVoltageRange">resetVoltageRange()</a></dt>
<dd><p>Resets the min and max voltage registers</p>
</dd>
<dt><a href="#powerCycleRelay">powerCycleRelay(relay, delayTime)</a></dt>
<dd><p>Power cycle a specific relay on the ups</p>
</dd>
<dt><a href="#powerCycleMasterRelay">powerCycleMasterRelay(delayTime)</a></dt>
<dd><p>Power cycle the master relay</p>
</dd>
<dt><a href="#selfTest">selfTest()</a></dt>
<dd><p>Trigger a self-test</p>
</dd>
<dt><a href="#reboot">reboot()</a></dt>
<dd><p>Reboot the UPS</p>
</dd>
<dt><a href="#writeUnitId">writeUnitId(unitId)</a></dt>
<dd><p>Write the unit ID to the UPS</p>
</dd>
<dt><a href="#writePreDelay">writePreDelay(delayTime)</a></dt>
<dd><p>Write the pre-delay (used before shutdown and relay control functions)</p>
</dd>
<dt><a href="#relayOn">relayOn(relay)</a></dt>
<dd><p>Turns a relay on</p>
</dd>
<dt><a href="#relayOff">relayOff(relay)</a></dt>
<dd><p>Turns a relay off</p>
</dd>
<dt><a href="#masterRelayOn">masterRelayOn()</a></dt>
<dd><p>Turns master relay on</p>
</dd>
<dt><a href="#masterRelayOff">masterRelayOff()</a></dt>
<dd><p>Turns master relay off</p>
</dd>
<dt><a href="#disableWatchdog">disableWatchdog()</a></dt>
<dd><p>Disables the watchdog feature</p>
</dd>
<dt><a href="#enableWatchdog">enableWatchdog(delay)</a></dt>
<dd><p>Enables the watchdog feature</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UPSState">UPSState</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="_registerReceivedOpcode"></a>

## \_registerReceivedOpcode(packet)
Keeps a list of recieved opcodes to determine
  When we've received all neccessary data to
  provide full state to getStatus function

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>array</code> | Incoming packet from the UPS. An array of bytes. |

<a name="_sendCommand"></a>

## \_sendCommand(opcode, params)
Pack and send a command to the UPS

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| opcode | <code>string</code> | single character opcode |
| params | <code>array</code> | array of bytes representing the command parameters. |

<a name="getStatus"></a>

## getStatus() ⇒ [<code>UPSState</code>](#UPSState)
Return state immediately if initialized,
Check every 100ms until initialization is
complete otherwise.

**Kind**: global function  
**Returns**: [<code>UPSState</code>](#UPSState) - - Object containing the state of the UPS  
<a name="writeSettings"></a>

## writeSettings(flags)
Write system settings to the UPS. 
Any settings not included to will be left the same.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| flags | <code>object</code> | An object containing the settings to write. |
| flags.autostartAfterShutdown | <code>boolean</code> | Automatically restart the system after a shutdown |
| flags.autostartAfterDelayedWakeup | <code>boolean</code> | Automatically restart the system after a delayed wakeup |
| flags.autostartAfterDelayedWakeup | <code>boolean</code> | Automatically restart the system after low voltage cutoff. |
| flags.autostartAfterOverload | <code>boolean</code> | Automatically restart the system after overload. |
| flags.autostartAfterOverTemp | <code>boolean</code> | Automatically restart the system after an over temp situation. |
| flags.enableBiweeklyAutoSelfTest | <code>boolean</code> | Enable 14 day self tests. |

<a name="resetVoltageRange"></a>

## resetVoltageRange()
Resets the min and max voltage registers

**Kind**: global function  
<a name="powerCycleRelay"></a>

## powerCycleRelay(relay, delayTime)
Power cycle a specific relay on the ups

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| relay | <code>number</code> | Relay index (0=master) |
| delayTime | <code>number</code> | Delay time in ms before turning power back on |

<a name="powerCycleMasterRelay"></a>

## powerCycleMasterRelay(delayTime)
Power cycle the master relay

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| delayTime | <code>number</code> | Delay time in ms before turning power back on |

<a name="selfTest"></a>

## selfTest()
Trigger a self-test

**Kind**: global function  
<a name="reboot"></a>

## reboot()
Reboot the UPS

**Kind**: global function  
<a name="writeUnitId"></a>

## writeUnitId(unitId)
Write the unit ID to the UPS

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| unitId | <code>number</code> | 16bit unit number |

<a name="writePreDelay"></a>

## writePreDelay(delayTime)
Write the pre-delay (used before shutdown and relay control functions)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| delayTime | <code>number</code> | delay time in seconds |

<a name="relayOn"></a>

## relayOn(relay)
Turns a relay on

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| relay | <code>number</code> | relay index (0=master) |

<a name="relayOff"></a>

## relayOff(relay)
Turns a relay off

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| relay | <code>number</code> | relay index (0=master) |

<a name="masterRelayOn"></a>

## masterRelayOn()
Turns master relay on

**Kind**: global function  
<a name="masterRelayOff"></a>

## masterRelayOff()
Turns master relay off

**Kind**: global function  
<a name="disableWatchdog"></a>

## disableWatchdog()
Disables the watchdog feature

**Kind**: global function  
<a name="enableWatchdog"></a>

## enableWatchdog(delay)
Enables the watchdog feature

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | Delay time in seconds (must be >1); |

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