import { Server } from './Server'
import { client } from '../../mesa-http/src'
import { Client } from './Client'

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

export function transport(opts) {
  return ({ service, ingress, egress }) => {
    const server = createServer(opts)

    server.use(service)

    ingress.define((...args) => server.listen(...args))
    egress.define((action, ...args) => service.action(action, client(...args)))
  }
}

export default module.exports
