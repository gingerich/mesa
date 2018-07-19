const Mesa = require('./lib')

// Mesa.create()
//   .call({ a: 1 }).then(console.log.bind(console, 'done'))

// const Context = Mesa.createContext(123)

// const context = ({ Context }) => (LoC) => {
//   return Mesa.Component.functional((config) =>
//     Context.spec({
//       subcomponents: ctx => LoC.spec({ ...config, ctx })
//     })
//   )
// }

// class Test extends Mesa.Component {

//   get call () {
//     return this.config.ctx.call
//   }

//   compose () {
//     return msg => this.call({ a: 1, val: this.config.value })
//   }
// }

// const ContextAwareTest = context(service)(Test)

// service.ns({ ns: 'test' })
// .action({a:1}, msg => ({ ...msg, done: 'ok' }))
// .action({a:2}, ContextAwareTest.spec({ value: 'test' }))
// .action({a:3}, msg => msg)

const testService = Mesa.createService().action({ foo: 'bar' }, () => ({
  you: 'bad boy lance'
}))

Mesa.createService(() => ({
  actions: [
    Mesa.action({ a: 1 }, ({ msg }) => ({ ...msg, done: 'ok' })),
    // Mesa.action({a:2}, ContextAwareTest.spec({ value: 'test' }))
    Mesa.action({ foo: 'foo' }, () => 'wut'),
    Mesa.action({ foo: 'bar' }, ctx => ctx.defer()),
    // Mesa.action({foo:'bar' }, ctx => ({ ...ctx.defer(), a: 1 })),
    Mesa.action(['add', { test: true }], ({ msg: [c, { a, b }] }) => ({
      sum: a + b
    }))
  ]
}))
  .use(testService)

  // // .call({ ns: 'test', a: 2 }).then(res => console.log(res))
  .call({ foo: 'bar' })
  .then(res => console.log(res))
// .call('add', { test: true, a: 1, b: 5 }).then(res => console.log(res))

// Mesa.createService()
//   .action((service) => ({
//     add ({ a, b }) {
//       return a + b
//     },
//     sub ({ a, b }, next) {
//       return a - b
//     }
//   }))
//   .action({ act: 'add' }, ({ a, b }) => a + b)

// Mesa.createService({ upstream: [auth()] })
//   .action({ act: 'add' }, Users)
//   .action({ act: 'sub' }, ({ ctx }) => (msg) => {
//     return ctx.call({ act: 'add', a: msg.a, b: -msg.b })
//   })
