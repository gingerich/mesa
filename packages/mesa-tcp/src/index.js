import { Server } from './Server'
import { Client } from './Client'
import { once } from 'events'

export * from './Client'
export * from './Server'

export function createServer(opts) {
  return new Server(opts)
}

export function listen(server, component, ...listenArgs) {
  return server.plugin(service => service.use(component)).listen(...listenArgs)
}

export function client(config) {
  return Client.spec(config)
}

export function plugin(opts = {}) {
  return service => {
    service.on('connect', () => {
      const server = listen(createServer(opts.server), service, opts.connection)
      once(server, 'listening').then(() =>
        service.emit('tcp:connected', server)
      )
    })
  }
}

export function transport(opts = {}) {
  const defaultConnection = {
    port: 3000
  }

  return connection => {
    connection = { ...defaultConnection, ...connection }

    return {
      ingress(service) {
        const server = listen(createServer(opts.server), service, connection)
        return once(server, 'listening').then(() => connection)
      },

      egress(service, action) {
        service.action(action, client(connection))
      }
    }
  }
}

export default module.exports
