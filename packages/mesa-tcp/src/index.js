import { Server } from './Server'
import { Client } from './Client'
import { once } from 'events'

export * from './Client'
export * from './Server'

export function createServer(opts) {
  return new Server(opts)
}

export function listen(component, ...args) {
  return createServer()
    .use(component)
    .listen(...args)
}

export function client(config) {
  return Client.spec(config)
}

export function plugin(opts) {
  return service => listen(service, opts)
}

export function transport(opts = {}) {
  return connection => ({
    ingress(service) {
      const server = createServer(opts.server).use(service)
      const tcp = server.listen(connection.port)
      return once(tcp, 'listening')
    },

    egress(service, action) {
      if (!action) {
        service.use(client(...connection.args))
      } else {
        service.action(action, client(...connection.args))
      }
    }
  })
}

export default module.exports
