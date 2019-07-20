import { Service } from '@mesa/core'
import Connector from './connector'
import Interface from './interface'

class Ingress extends Interface {
  at(protocol, ...args) {
    super.at(protocol, ...args)
    return this
  }

  resolve(connection) {
    return new Ingress.Connector(connection)
  }

  connector(resolve, transit) {
    return service => {
      const ingressService = Service.create()
        .use(this.parent.middleware)
        .use(this.middleware)
        .use(transit.ingress())
        .use(ctx => service.call(ctx.msg))

      return super.connector(resolve, transit)(ingressService)
    }
  }
}

Ingress.Connector = class IngressConnector extends Connector {
  connector(resolve) {
    return service => {
      const transport = resolve(this.connection)
      return transport.ingress(service)
    }
  }
}

module.exports = Ingress
