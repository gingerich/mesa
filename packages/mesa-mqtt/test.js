const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost:1883')

client.on('message', (topic, message) => {
  console.log('RESPONSE', message.toString(), topic)
})

client.on('connect', () => {
  client.subscribe('output', err => {
    if (err) console.error(err)
    client.publish('input', JSON.stringify({ test: 123, foo: 'wutt' }))
  })
})
