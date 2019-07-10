import { Service } from '@mesa/core'
import Connector from './connector'
import Interface from './interface'

class Ingress extends Interface {
  at(...args) {
    super.at(...args)
    return this
  }

  resolve(connection) {
    return new Ingress.Connector(connection)
  }

  connector(resolve, transit) {
    return service => {
      const s = Service.create()
        .use(this.parent.middleware)
        .use(this.middleware)
        .use(transit.ingress())
        .use(ctx => service.call(ctx.msg))

      return super.connector(resolve, transit)(s)
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
