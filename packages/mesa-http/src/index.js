import { Client } from './Client'
import { Server } from './Server'

export function createServer(opts) {
  return new Server(opts)
}

export function client(opts) {
  return Client.spec(opts)
}

export function listen(component, ...args) {
  return server()
    .use(component)
    .listen(...args)
}

export function plugin(opts) {
  return mesa => listen(mesa, opts)
}

export function transport(options) {
  return ({ service, ...transport }) => {
    const serverOpts = {
      prefix: '/call',
      msgFromRequest: Http.ExtractMsg.fromBody(),
      ...options
    }

    const http = server(serverOpts)

    http.use(service)

    transport.listen((...args) => http.listen(...args))
    transport.client((action, ...args) =>
      service.action(action, client(...args))
    )
  }
}

export function koaMiddleware(component) {
  return async function(ctx, next) {
    const res = await compose(component /* context? */)(ctx, function(msg) {
      return next().then(() => msg)
    })

    if (res) ctx.body = res
  }
}

export * from './middleware/Controller'
export * from './middleware/Layer'
export * from './middleware/Method'
// export * from './middleware/Module'
export * from './middleware/Params'
export * from './middleware/Path'
export * from './middleware/Route'
export * from './middleware/Router'

export * from './Request'
export * from './Client'
export * from './Server'

export default module.exports
