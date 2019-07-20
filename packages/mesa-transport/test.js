const Mesa = require('@mesa/core')
const Transport = require('./lib')
const { transport: tcp } = require('../mesa-tcp/lib')
const { transport: mqtt } = require('../mesa-mqtt/lib')

const layer = Transport.createLayer()
  .protocol('tcp', tcp())
  .protocol('mqtt', mqtt())
  .use(Transport.Serialize.JSON())

const transport = layer.transporter(connect => {
  connect.ingress.at('tcp')
  connect.egress.at('tcp://localhost:3001').action({ test: true })
  // connect.at('mqtt://localhost:1883', { debug: true })
})

const service = Mesa.createService('test').plugin(transport.plugin())
service.action(
  { test: 123 },
  async ctx => `remote: ${await ctx.call({ test: true })}`
)
service.action(
  { test: 123, foo: 'hello' },
  async ctx => `This is the msg: ${ctx.msg.foo} : ${await ctx.defer()}`
)

const otherTransport = layer.transporter(connect => {
  connect.ingress.at('tcp://localhost:3001')
})
Mesa.createService('other')
  .plugin(otherTransport.plugin())
  .action({ test: true }, ctx => `remote RESPONSE!!`)

otherTransport.connect().then(() => console.log('other service connected!'))

// hmm.. match algorithm should return EVERY action that matches ordered by specificity, same pattern in the order they were added

transport.on('error', err => console.error('bad', err))
transport.on('listening', r => console.log('listening', r))

transport.connect().then(() => {
  console.log('connected!')
})

service
  // .call({ test: 123, foo: 'hello', bar: 'wut' })
  .call({ test: 123, foo: 'hello' })
  .then(r => console.log('result', r))
