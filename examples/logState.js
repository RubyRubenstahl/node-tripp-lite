const UPS = require('../src/index');
const ups = new UPS();

// Locs a simple
ups.on('change', ({ property, value }) => {
    const timestamp = new Date().toISOString();
    console.log([timestamp, property, value].join(', '));
})
