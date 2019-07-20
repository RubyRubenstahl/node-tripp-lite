const UPS = require('../src/index');

const ups = new UPS();
ups.writeSettings({
    autostartAfterShutdown: true
})