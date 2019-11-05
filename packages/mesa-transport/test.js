const Mesa = require('@mesa/core')
const Transport = require('./lib')
const { transport: tcp } = require('../mesa-tcp/lib')
const { transport: mqtt } = require('../mesa-mqtt/lib')
const { transport: kafka, logLevel } = require('../mesa-kafka/lib')
const { transport: ssb, generateKey } = require('../mesa-ssb/lib')

// const mesh = opts => (connect, layer) => {
//   layer.protocol('udp', udp())

//   connect.at()
// }

// Transport.createLayer().use(mesh())

const keys = generateKey()
const keys2 = generateKey()

const layer = Transport.createLayer()
  .protocol('tcp', tcp())
  .protocol('mqtt', mqtt())
  .protocol('kafka', kafka())
  .protocol('ssb', ssb())
  .use(Transport.Serialize.JSON())

const transport = layer.transporter(connect => {
  // connect.ingress.at('tcp')
  // connect.egress.at('tcp://localhost:3001').action({ test: true })
  // connect.at('mqtt://localhost:1883', { debug: true })
  // connect.at({
  //   scheme: 'kafka',
  //   brokers: ['192.168.99.100:9092'],
  //   logLevel: logLevel.DEBUG
  // })
  connect.at('ssb', {
    keys: keys2,
    connections: {
      incoming: {
        net: [
          {
            host: 'localhost',
            port: 8008,
            scope: 'device',
            transform: 'shs'
          }
        ]
      }
    },
    seeds: [{ host: 'localhost', port: 8009, key: keys.id }],
    logging: {
      level: 'info'
    }
  })
})

const service = Mesa.createService('test').plugin(
  transport.plugin({ nodeId: 'test' })
)
service.action(
  { test: 123 },
  async ctx =>
    `remote: ${await ctx.call({ test: true }, null, {
      fallback: 'welp!',
      nodeId: 'other'
    })}`,
  {
    fallback(ctx) {
      return 'this is fun!'
    }
  }
)
service.action(
  { test: 123, foo: 'hello' },
  async ctx => `This is the msg: ${ctx.msg.foo} : ${await ctx.defer()}`
)

const otherTransport = layer.transporter(connect => {
  // connect.ingress.at('tcp://localhost:3001')
  // connect.at({
  //   scheme: 'kafka',
  //   brokers: ['192.168.99.100:9092'],
  //   logLevel: logLevel.DEBUG
  // })
  connect.at('ssb', {
    keys,
    connections: {
      incoming: {
        net: [
          {
            host: 'localhost',
            port: 8009,
            scope: 'device',
            transform: 'shs'
          }
        ]
      }
    },
    seeds: [{ host: 'localhost', port: 8008, key: keys2.id }],
    logging: {
      level: 'info'
    }
  })
})
Mesa.createService('other')
  .plugin(otherTransport.plugin({ nodeId: 'other' }))
  .action({ test: true }, ctx => `remote RESPONSE!!`)

const p = otherTransport
  .connect()
  .then(() => console.log('other service connected!'))

transport.on('error', err => console.error('bad', err))
transport.on('listening', r => console.log('listening', r))

transport
  .connect()
  .then(() => p)
  .then(() => {
    console.log('connected!')
  })
  .then(() => {
    service.call({ test: 123 }).then(
      result => {
        console.log('RESULT', result)
      },
      err => console.error('bad', err)
    )
  })

// service.call({ test: 123 }).then(
//   result => {
//     console.log('RESULT', result)
//   },
//   err => console.error('bad', err)
// )
