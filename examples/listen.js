const UPS = require('../src/index');

const ups = new UPS();
ups.on('change', ({ property, value }) =>
    console.log(`The ${property} value has changed to ${value}`)
)

ups.on('connected', deviceDescriptor => {
    console.log('Connected')
    console.log(deviceDescriptor)
})

ups.on('disconnected', deviceDescriptor => {
    console.log('Disconnected')
    console.log(deviceDescriptor)
})

ups.on('initialized', state => {
    console.log('Initialized')
    console.log(state)
})

