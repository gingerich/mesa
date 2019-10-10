import { Service, Message, Middleware, Errors } from '@mesa/core'
import Connector from './connector'
import Interface from './interface'

class Egress extends Interface {
  at(protocol, ...args) {
    super.at(protocol, ...args)
    return this // ?
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

      const egressFallback = Middleware.fallback((ctx, err) => {
        if (err instanceof Errors.UnhandledMessageError) {
          console.log('call egress', ctx.cmd)
          return egressService.call(ctx.msg, null, { ctx })
        }

        throw err
      })

      service.use(egressFallback)

      // service.use(async (ctx, next) => {
      //   // Attempt to handle message locally first
      //   return next(ctx).catch(error => {
      //     if (error instanceof Error) {
      //       return egressService.call(null, { ctx })
      //     }

      //     return Promise.reject(error)
      //   })

      //   const result = await next(ctx)
      //   console.log('MSG', result)
      //   if (result !== Message.UNHANDLED) {
      //     return result
      //   }
      //   console.log('egress', ctx.msg)
      //   return egressService.call(null, { ctx })
      // })

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
