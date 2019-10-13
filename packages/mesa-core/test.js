const { ServiceBroker, Component } = require('./lib')
// import Mesa, { ServiceBroker as Broker } from '@mesa/core'

const broker = new ServiceBroker()

const ops = broker.createService({
  name: 'ops',
  actions: [
    ['add', ({ msg: { a, b } }) => a + b],
    ['sub', ({ msg: { a, b } }) => a - b]
  ]
  // actions: {
  //   add: {
  //     match: { act: 'add', test: 1 },
  //     fallback: 'foo',
  //     handler() {}
  //   }, // .action({ act: 'add', test: 1 }, handler, { fallback })
  //   sub: () => {}, // .action('sub', () => {})
  //   mult: Multiply.spec() // .action('mult', Multiply.spec())
  // }
})

broker.createService('math').use('ops', ops) // Problem: ops is "double used"

const add = broker.call.bind(broker, 'math.ops.add')
const sub = broker.call.bind(broker, 'math.ops.sub')

async function fn() {
  aMinusB = await sub({ a: -4, b: 2 })
  return add({ a: 8, b: aMinusB })
}

let i = 1000
while (--i) {
  // fn()
}
// fn().then(console.log.bind(console))

class Test extends Component {
  compose(stack) {
    return async ctx => {
      return `this is a test: ${ctx.config.foo} ${await ctx.call('test.bar', {
        test: 'test'
      })}`
    }
  }
}

test = new ServiceBroker({
  foo: 'bar'
})

test
  .createService({
    name: 'test'
  })
  .use((ctx, next) => {
    ctx.configure({
      foo: 'foo'
    })
    return next(ctx)
  })
  .action('bar', ({ msg }) => `Hello ${msg.test}`)
  .action('foo', Test.spec({ a: 1 }))
// .event('user.created', UserCreated.spec())
// .event('.node.*', () => {})

test.call('test.foo').then(console.log.bind(console))

const cache = opts => service => {
  const cache = {}
  service.hook('action', async (ctx, next) => {
    const config = { ...opts, ...ctx.config.cache }
    const { key } = config
    let result = cache[key]
    if (result === undefined) {
      result = await next(ctx)
      cache[key] = result
    }
    return result
  })
}

const m = (ctx, next) => {
  ctx.hook('action')(next)
}

class Hook extends Mesa.Component {
  compose() {
    return (ctx, next) => ctx.hook(this.config.name)(next)
  }
}

const transport = Transport.createLayer()
  .protocol('tcp', TCP.transport())
  .transport(({ ingress, egress }) => {
    ingress.at('tcp://localhost:3000').use(Transport.retries())
  })

broker.plugin(transport.plugin())

transport.connect()
