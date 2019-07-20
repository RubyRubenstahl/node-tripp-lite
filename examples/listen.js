const UPS = require('../src/index');

const ups = new UPS();
ups.on('change', ({ property, value }) =>
    console.log(`The ${property} value has changed to ${value}`)
)