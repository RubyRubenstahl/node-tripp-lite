const UPS = require('../src/index');

// Turns the master relay off, waits 20 seconds, then turns it back on.
const ups = new UPS();
// ups.masterRelayOff();

ups.relayOn(0);
// ups.relayOn(1);
// ups.relayOn(2);