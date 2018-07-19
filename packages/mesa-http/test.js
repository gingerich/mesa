Mesa = require('@mesa/core')
// Transport = require('@mesa/transport')
Http = require('./lib')

// s = Mesa.createService()
//   .action({ a: '1' }, ({ b }) => ({ status: 'Amazing!', b }))

// Http.createServer().use(s)
//   .use(
//     Http.router()
//       .param('id', (ctx, id) => ctx.user = { id, name: 'Foo' })
//       .use((ctx, next) => next(ctx).then(c => {c.foo = 'ASDAF##'; return c}))
//       .get('/foo', ctx => ctx.body = 'bar')
//       .get('/foo/:id', ctx => ctx.body = ctx.user)
//       // .get('/test', ctx => ctx.body = http.service.call(ctx.query))
//   )
//   .listen(3000)

// const http = Http.transport

const transport = Transport.create().use('http', Http.transport())

const bootstrap = ({ transports }) => {
  transports.http.listen(3000)
}

Mesa.createService()
  .plugin(transport.plugin(bootstrap))
  // .plugin(transport.plugin({ ready }))
  .action({ a: '1' }, msg => ({ status: 'ok', ...msg }))
  .start()

const s2 = Mesa.createService()
  .plugin(transport.plugin(({ listen }) => listen('http', 3001)))
  .action({ foo: 'bar' }, msg => ({ hello: 'world' }))

s2.ns({ cmd: 'test' }, { destructure: 'msg' }).action({ a: 2 }, msg => msg)

s2.start()
