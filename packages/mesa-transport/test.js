const Mesa = require('@mesa/core')
const Transport = require('./lib')
const { transport: tcp } = require('../mesa-tcp/lib')

const service = Mesa.createService('test')
service.action({ test: 123 }, ctx => ({
  data: `This is the msg ${ctx.msg.foo}`
}))

const layer = Transport.createLayer()
  // .use((ctx, next) => {
  //   ctx.msg = JSON.parse(ctx.msg.toString('utf8'))
  //   return next()
  // })
  .use(Transport.Serialize.JSON())
  .protocol('tcp', tcp({}))

const transport = layer.transport(connect => {
  connect.ingress.at('tcp://localhost:3000')
})

service.plugin(transport.plugin())

// service.call({ test: 123, foo: 'bar' }).then(result => console.log(result))

transport.connect().then(() => {
  console.log('listening!!!')
})

// const mqtt = opts => {
//   const connect = () => {}

//   return {
//     ingress: service => {
//       mqtt.subscribe('test')
//       mqtt.on('message', msg => {
//         service.call(msg).then(result => {
//           mqtt.publish('test', result)
//         })
//       })
//     },
//     egress: service => {
//       service.use(transit.egress())
//       service.use(ctx => {
//         return mqtt.publish(ctx.msg)
//       })
//       service.use(async ctx => {
//         const p = transit.makeRequest(ctx)
//         return mqtt.publish(ctx.msg).then(p)
//       })
//     }
//   }
// }

// // const caller = act => {
// //   act({ a: 1 }).then(console.log.bind(console))
// // }

// // const layer = Transport.createLayer()
// //   .use(
// //     Transport.Network.retries({
// //       enabled: true
// //     })
// //   )
// //   .use(FaultTolerance.circuitBreaker({}))
// //   .protocol('tcp', TCP.transport())

// // const transport = layer.make()

// // Mesa.createService()
// //   .action({ a: 1 }, ({ msg }) => ({ ...msg, done: 'ok' }))
// //   .plugin(transport.plugin())

// // transport.start(({ tcp }) => {
// //   tcp.listen(3000)
// //   tcp.listen(3001)
// //   tcp.listen(3002)
// // })

// // broker.transport('tcp', TCP.transport())
// // broker.transport('tcp', service => ({
// //   egress: () => {},
// //   ingress: () => {}
// // }))

// // broker.listen('tcp', 3000)

// // // Mesa.createService()
// // //   .action(['test'], ({ msg: [test, { foo }] }) => foo)
// // //   .call(['test', { foo: 'bar!!!' }])
// // //   .then(console.log.bind(console))

// // const start = ({ tcp }) => {
// //   tcp.listen(3000)
// // }

// // const transport = Transport.createLayer()
// //   .use(Transport.retries())
// //   .protocol('tcp', TCP.transport())

// // transport.egress('tcp', '127.0.0.1').action({ a: 1 })

// // transport.ingress('tcp', 3000)

// // Mesa.createService()
// //   .use(transport.plugin())
// //   .action({ a: 1 }, transport.client('tcp', '127.0.0.1'))
// //   .ingress()

// // transport.client('tcp').egress()

// // const transport = Transport.create()
// //   .use(Transport.retries())
// //   .protocol('tcp', TCP.transport())

// // Mesa.createService().use(
// //   transport.plugin(layer => {
// //     tcp = layer.protocol('tcp')
// //     layer.ingress('tcp', 3000)

// //     layer.egress({ a: 1 }, transport.client('tcp', 3000))
// //     layer.egress('tcp', { a: 1 }, '127.0.0.1')
// //   })
// // )

// // const layer = Transport.createLayer().protocol('tcp', TCP.transport())

// // const transport = layer.transport(({ ingress, egress }) => {
// //   ingress.at('tcp', 3000).use(() => {})
// //   ingress.at({ protocol: 'tcp', port: 3000 })
// //   ingress.at('tcp://localhost:3000')

// //   egress.at('tcp://demo.test.com').action({ a: 1 })
// // })

// // transport.connect()

// class TCP extends Transporter {
//   connect(connection) {}

//   ingress(service) {}

//   egress(service) {}
// }

// mqtt = opts => connection => {
//   client = mqtt.connect(connection)
//   return {
//     connect(options) {},
//     ingress(service) {
//       const tcp = createServer()
//         .use(service)
//         .listen(connection)
//     },
//     egress() {}
//   }
// }

// class Ingress extends Interface {
//   connect(service) {
//     const s = createService()
//       .use(this.middleware)
//       .use(this.transit.ingress())
//       .use(ctx => service.call(ctx.msg))

//     return this.transport.ingress(s)
//   }
// }

// class Egress extends Interface {
//   connect(service) {
//     const s = createService()
//       .use(this.middleware)
//       .use(this.transit.egress())

//     service.use(s)

//     return this.transport.egress(s)
//   }
// }

// p = Promise.resolve(transport.connect())

// p.then(transport.ingress(service))
// p.then(transport.egress(service))

// layer.transport(connect => {
//   connect.ingress.at('tcp://localhost:3000')
//   connect.at('tcp')
//   connect.at('nats')
// })

// class Interface {
//   static getResolver(transports) {
//     return (protocol, ...args) => {
//       const connection = Connection.resolve(protocol, ...args)
//       connection.args = args

//       const { protocol: p } = connection
//       const name = p.slice(0, p.indexOf(':'))
//       const transport = transports[name]

//       invariant(transport, `No protocol definition for ${name}`)

//       return new this(transport, connection)
//     }
//   }

//   middleware = []
//   ingress = {
//     at(...args) {
//       return new Interface.Ingress.resolve()
//     }
//   }

//   use(...middleware) {
//     this.middleware = this.middleware.concat(...middleware)
//     return this
//   }

//   connect(service) {
//     return this.interfaces.map(iface => iface.connect(service))
//   }
// }

// class FullInterface {
//   ingress = new Ingress(this)
//   egress = new Egress(this)

//   connect(service) {
//     this.ingress.connect(service)
//     this.egress.connect(service)
//   }
// }

// class Ingress extends Interface {
//   construct(iface) {
//     this.iface = iface
//   }

//   connect(service) {
//     this.iface.connection
//   }
// }

// connect.at('nats') // Interface.getResolver()('nats').connector(new Ingress())
// connect.ingress.at('nats')

// class Connector {
//   constructor(connection) {
//     this.connection = connection
//   }

//   // connect(service) {
//   //   throw new Error('Not Implemented')
//   // }

//   connector(transit) {
//     throw new Error('Not Implemented')
//   }
// }

// class Ingress extends Connector {}

// class Interface extends Connector {
//   connectors = []
//   middleware = []

//   constructor(transport, connection) {
//     super(connection)
//     this.transport = transport
//   }

//   use(...middleware) {
//     this.middleware = this.middleware.concat(...middleware)
//     return this
//   }

//   connector(connector) {
//     this.connectors.push(connector)
//     return this
//   }

//   ingress() {
//     this.connector(new Ingress(this.connection))
//   }

//   connect(service) {
//     return this.connectors.map(c => c(service))
//   }
// }

// class Interface extends Connector {
//   static connector() {
//     return (transport, connection) => new this(transport, connection)
//   }

//   constructor(transport, connection) {
//     super(connection)
//     this.transport = transport
//     this.connectors = []
//     this.middleware = []
//   }

//   use(...middleware) {
//     this.middleware = this.middleware.concat(...middleware)
//     return this
//   }

//   // ingress() {
//   //   const ingress = new Interface.Ingress(this)
//   //   this.add(ingress)
//   //   return ingress
//   // }

//   // egress() {
//   //   const egress = new Interface.Egress(this)
//   //   this.add(egress)
//   //   return egress
//   // }

//   get ingress() {
//     if (!this._ingress) {
//       this._ingress = new Interface.Ingress(this)
//       this.add(this._ingress)
//     }

//     return this._ingress
//   }

//   get egress() {
//     if (!this._egress) {
//       this._egress = new Interface.Egress(this)
//       this.add(this._egress)
//     }

//     return this._egress
//   }

//   at(...args) {
//     const iface = resolve(...args)
//     this.add(iface)
//     return iface
//   }

//   add(connector) {
//     if (typeof connector === 'function') {
//       connector = connector(this.connection, this.transport)
//     }

//     invariant(connector instanceof Connector, 'expected instance of Connector')

//     this.connectors.push(connector)
//   }

//   connector(transit) {
//     // const connectors = this.connectors
//     // return Connector.resolve({
//     //   connect(service) {
//     //     return connectors.map(c => c.connect(service))
//     //   }
//     // })
//     return service => {
//       return this.connectors.map(c => c.connector(transit)(service))
//     }
//   }

//   connect(service) {
//     // return
//   }
// }

// class Ingress extends Interface {
//   // connect(service) {
//   //   const s = Mesa.createService('123')
//   //     .use(this.middleware)
//   //     .use(transit.ingress())
//   //     .use(ctx => service.call(ctx.msg))

//   //   this.transport.ingress(s, this.connection)

//   //   return super.connect(s)
//   // }

//   connector(transit) {
//     return service => {
//       const s = Mesa.createService('123')
//         .use(this.middleware)
//         .use(transit.ingress())
//         .use(ctx => service.call(ctx.msg))

//       this.transport.ingress(s, this.connection)

//       // return super.connect(s)
//       return super.connector(transit)(s)
//     }
//   }
// }

// class Egress extends Interface {
//   connect(service) {
//     const s = Mesa.createService('321').use(this.middleware)
//     // .use(transit.egress())
//     service.use(s)

//     if (!this.actions.length) {
//       return this.transport.egress(s, this.connection)
//     }

//     const connections = this.actions.map(action =>
//       this.transport.egress(s, this.connection, action)
//     )

//     return super.connect(s)
//   }
// }

// connect.at('nats')
// connect.ingress.at('tcp')

// connect.ingress.at('tcp')
