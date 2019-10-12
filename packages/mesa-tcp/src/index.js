import { once } from 'events'
import { Stack } from '@mesa/core'
import { Server } from './Server'
import { Client } from './Client'

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

  return (connection, transit) => {
    connection = { ...defaultConnection, ...connection }

    return Object.create({
      ingress(service) {
        const server = listen(createServer(opts.server), service, connection)
        server.on('listening', () =>
          transit.transporter.emit('listening', 'tcp')
        )
        return once(server, 'listening').then(() => connection)
      },

      egress(service, action) {
        service.action(
          action,
          Stack.spec()
            .use((ctx, next) => {
              return next(ctx).then(result => {
                const pkt = ctx.deserialize(result, 'RESPONSE')
                transit.ingressHandler.handleResponse(pkt)
              })
            })
            .use(client(connection))
        )
      },

      get writer() {
        if (!this._writer) {
          // TODO
        }

        return this._writer
      },

      get reader() {
        if (!this._reader) {
          // TODO
        }

        return this._reader
      }
    })
  }
}

export default module.exports
