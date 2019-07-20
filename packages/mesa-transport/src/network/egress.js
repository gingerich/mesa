import { Service } from '@mesa/core'
import Connector from './connector'
import Interface from './interface'

class Egress extends Interface {
  at(protocol, ...args) {
    super.at(protocol, ...args)
    return this
  }

  action(action) {
    this._action = action
    return this
  }

  resolve(connection) {
    return new Egress.Connector(this, connection)
  }

  connector(resolve, transit) {
    return service => {
      const egressService = Service.create()
        .use(this.parent.middleware)
        .use(this.middleware)
        .use(transit.egress())

      service.use(async (ctx, next) => {
        const msg = await next(ctx) // let local service try to handle it??
        if (msg) return msg // TODO check if handled
        return egressService.call(ctx.msg)
      })

      // if (!this.actions.length) {
      //   return transport.egress(egressService)
      // }

      // const connections = this.actions.map(action =>
      //   transport.egress(egressService, this.connection, action)
      // )

      return super.connector(resolve, transit)(egressService)
    }
  }
}

Egress.Connector = class EgressConnector extends Connector {
  constructor(egress, connection) {
    super(connection)
    this.egress = egress
  }

  connector(resolve) {
    return service => {
      const transport = resolve(this.connection)
      return transport.egress(service, this.egress._action)
    }
  }
}

module.exports = Egress
