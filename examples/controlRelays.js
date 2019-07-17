const UPS = require('../src/index');

// Turns the master relay off, waits 20 seconds, then turns it back on.
const ups = new UPS();
ups.masterRelayOff();
setTimeout(() => ups.masterRelayOn(), 20000)

