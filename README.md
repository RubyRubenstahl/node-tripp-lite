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
// Example output (abberviated):
{
batteryLow: false,
deviceName: 'TRIPP LITE SMART1000RM1',
faults: 'noFault',
firmware: '2602 Rev A',
frequency: 59.9,
frequencyMode: 60,
inverterOn: false,
loadRelaysPowered: [ true, true ],
masterRelayPowered: true,
nominalVac: 120,
nominalVdc: 24,
powerRating: 1000,
switchableLoads: 2,
voltageAc: 115,
voltageAcMax: 117,
voltageAcMin: 113,
voltageDc: 13.6,
...
}
```
# API
## Classes

<dl>
<dt><a href="#UPS">UPS</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DeviceDescriptor">DeviceDescriptor</a> : <code>Object</code></dt>
<dd><p>HID Descriptor for the device.</p>
</dd>
<dt><a href="#UPSState">UPSState</a> : <code>Object</code></dt>
<dd><p>State of a Tripp-Lite UPS</p>
</dd>
</dl>

<a name="UPS"></a>

## UPS
**Kind**: global class  

* [UPS](#UPS)
    * _instance_
        * [.getStatus()](#UPS+getStatus) ⇒ [<code>Promise.&lt;UPSState&gt;</code>](#UPSState)
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
        * ["change"](#UPS+event_change)
        * ["initialized"](#UPS+event_initialized)
        * ["connected"](#UPS+event_connected)
        * ["disconnected"](#UPS+event_disconnected)
    * _static_
        * [.list()](#UPS.list) ⇒ [<code>Array.&lt;DeviceDescriptor&gt;</code>](#DeviceDescriptor)

<a name="UPS+getStatus"></a>

### ups.getStatus() ⇒ [<code>Promise.&lt;UPSState&gt;</code>](#UPSState)
Return state immediately if initialized,Check every 100ms until initialization iscomplete otherwise.

**Kind**: instance method of [<code>UPS</code>](#UPS)  
**Returns**: [<code>Promise.&lt;UPSState&gt;</code>](#UPSState) - - Object containing the state of the UPS  
**Example**  
```js
ups.getStatus().then(  status=>console.log(status));
```
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

**Example**  
```js
ups.writeSettings({    autostartAfterShutdown: true})
```
<a name="UPS+resetVoltageRange"></a>

### ups.resetVoltageRange()
Resets the min and max voltage registers

**Kind**: instance method of [<code>UPS</code>](#UPS)  
**Example**  
```js
ups.resetVoltageRange();
```
<a name="UPS+powerCycleRelay"></a>

### ups.powerCycleRelay(relay, delayTime)
Power cycle a specific relay on the ups

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| relay | <code>number</code> | Relay index (0=master) |
| delayTime | <code>number</code> | Delay time in ms before turning power back on |

**Example**  
```js
// Power cycle load 1 relay, waiting 20 seconds before restartingups.powerCycleRelay(1, 20000)
```
<a name="UPS+powerCycleMasterRelay"></a>

### ups.powerCycleMasterRelay(delayTime)
Power cycle the master relay

**Kind**: instance method of [<code>UPS</code>](#UPS)  

| Param | Type | Description |
| --- | --- | --- |
| delayTime | <code>number</code> | Delay time in ms before turning power back on |

**Example**  
```js
// Power cycle master relay, waiting 60 seconds before restartingups.powerCycleMasterRelay(60000)
```
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

<a name="UPS+event_change"></a>

### "change"
Emitted when any device property changes

**Kind**: event emitted by [<code>UPS</code>](#UPS)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| property | <code>string</code> | Name of the property that has changed |
| value | <code>boolean</code> \| <code>string</code> \| <code>number</code> \| <code>array</code> | The new value of the property |
| oldValue | <code>boolean</code> \| <code>string</code> \| <code>number</code> \| <code>array</code> | The old value of the property |

**Example**  
```js
ups.on('change', ({ property, value }) =>  console.log(`The ${property} value has changed to ${value}`))
```
<a name="UPS+event_initialized"></a>

### "initialized"
Emitted when data for all properties has been received after a device isconnected.

**Kind**: event emitted by [<code>UPS</code>](#UPS)  
**Example**  
```js
ups.on('initialized', state =>  console.log(state))
```
<a name="UPS+event_connected"></a>

### "connected"
A device has been connected

**Kind**: event emitted by [<code>UPS</code>](#UPS)  
**Example**  
```js
ups.on('connected', deviceDescriptor =>  console.log(`Connected to Tripp-lite UPS ${deviceDescriptor.productId}`))
```
<a name="UPS+event_disconnected"></a>

### "disconnected"
A device has been disconnected

**Kind**: event emitted by [<code>UPS</code>](#UPS)  
**Example**  
```js
ups.on('disconnected', deviceDescriptor =>  console.log(`${deviceDescriptor.productId} has been disconnected`))
```
<a name="UPS.list"></a>

### UPS.list() ⇒ [<code>Array.&lt;DeviceDescriptor&gt;</code>](#DeviceDescriptor)
Get a list of tripp-lite UPSs connected. The product ID can be used in the constructor function to connect to a specific device

**Kind**: static method of [<code>UPS</code>](#UPS)  
**Returns**: [<code>Array.&lt;DeviceDescriptor&gt;</code>](#DeviceDescriptor) - - Array of available devices  
**Example**  
```js
console.log( UPS.list() );//Example return value// {//   vendorId: 2478,//   productId: 1,//   path: '\\\\?\\hid#vid_09ae&pid_0001#6&1e92950d&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}',//   manufacturer: 'TRIPP LITE',//   product: 'TRIPP LITE SMART1000RM1U    ',//   release: 1,//   interface: -1,//   usagePage: 65440,//   usage: 1// }
```
<a name="DeviceDescriptor"></a>

## DeviceDescriptor : <code>Object</code>
HID Descriptor for the device.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| vendorId | <code>number</code> | Device vendor Id |
| productId | <code>number</code> | Used to select a specicific device in the constructor |
| path | <code>string</code> | HID path for the device |
| product | <code>string</code> | Product name |
| manufacturer | <code>string</code> | Device manufacturor |
| interface | <code>number</code> |  |
| usagePage | <code>number</code> |  |
| usage | <code>number</code> |  |

<a name="UPSState"></a>

## UPSState : <code>Object</code>
State of a Tripp-Lite UPS

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
| frequencyMode | <code>number</code> | AC Frequencey mode |
| idle | <code>boolean</code> |  |
| inverterOn | <code>boolean</code> |  |
| loadLevel | <code>number</code> | Output load level in percentage |
| loadRelaysPowered | <code>array</code> | Array of boolean values indicating the state of the load relays.                    The number of relays included is determinted by the value of switchableLoads. |
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