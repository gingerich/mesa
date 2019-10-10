import { Service } from '@mesa/core'
import Connector from './connector'
import Interface from './interface'
import Packet from '../packet'

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

      const connected = super.connector(resolve, transit)(ingressService)

      ingressService.use(ctx => {
        const { payload } = ctx.packet

        if (Packet.isRequest(ctx.packet)) {
          return service.call(payload.data)
        }

        if (Packet.isEvent(ctx.packet)) {
          return service.emit(payload.data)
        }

        throw new Error(
          `Ingress encountered unexpected packet type ${ctx.packet.type}`
        )
      })

      return connected
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
