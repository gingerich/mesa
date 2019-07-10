import { Service } from '@mesa/core'
import Connector from './connector'
import Interface from './interface'

class Egress extends Interface {
  connector(resolve, transit) {
    return service => {
      const s = Service.create()
        .use(this.parent.middleware)
        .use(this.middleware)
        .use(transit.egress())

      // service.use(s)

      // if (!this.actions.length) {
      //   return transport.egress(s)
      // }

      // const connections = this.actions.map(action =>
      //   transport.egress(s, this.connection, action)
      // )

      return super.connector(resolve, transit)(s)
    }
  }
}

Egress.Connector = class EgressConnector extends Connector {
  connector(resolve) {
    return service => {
      const transport = resolve(this.connection)
      if (!this.actions.length) {
        return transport.egress(service)
      }

      const connections = this.actions.map(action =>
        transport.egress(service, this.connection, action)
      )
      return Promise.all(connections)
    }
  }
}

module.exports = Egress
