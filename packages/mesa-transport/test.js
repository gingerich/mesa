const Mesa = require('@mesa/core')
const Transport = require('./lib')
const { transport: tcp } = require('../mesa-tcp/lib')
const { transport: mqtt } = require('../mesa-mqtt/lib')

const layer = Transport.createLayer()
  .protocol('tcp', tcp())
  .protocol('mqtt', mqtt())
  .use(Transport.Serialize.JSON())

const transport = layer.transport(connect => {
  connect.ingress.at('tcp', 3001)
  connect.at('mqtt', { host: 'localhost', port: 1883 })
})

const service = Mesa.createService('test').plugin(transport.plugin())
service.action({ test: 123 }, ctx => ({
  data: `This is the msg: ${ctx.msg.foo}`
}))

transport.connect().then(() => {
  console.log('listening!')
})
