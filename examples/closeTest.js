const UPS = require("../src/index");

const ups = new UPS();

setTimeout(async () => {
    console.log('Closing')
    await ups.close()
    console.log('Closed')
}, 10000);

ups.on("change", ({ property, value }) =>
  console.log(`The ${property} value has changed to ${value}`)
);

ups.on("connected", deviceDescriptor => {
  console.log("Connected");
  console.log(deviceDescriptor);
});

ups.on("disconnected", deviceDescriptor => {
  console.log("Disconnected");
  console.log(deviceDescriptor);
});

ups.on("initialized", state => {
  console.log("Initialized");
  console.log(state);
});

ups.on("error", err => {
  console.error("Initialized", err);
});

ups.on("power.lost", () => {
  console.log("Power Lost");
});

ups.on("power.restored", () => {
  console.log("Power Restored");
});
