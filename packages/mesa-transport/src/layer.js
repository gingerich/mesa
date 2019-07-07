import invariant from 'invariant'
import Transporter from './transporter'
import { Interface } from './network'

export default class Layer {
  constructor() {
    this.transports = {}
    this.middleware = []
  }

  protocol(name, transport) {
    // invariant(typeof init === 'function', 'Expected a function')

    this.transports[name] = transport
    return this
  }

  use(...middleware) {
    this.middleware = this.middleware.concat(...middleware).map(m => {
      if (typeof m === 'function') {
        return { ingress: m, egress: m }
      }
      return m
    })

    return this
  }

  // transport(init) {
  //   const transporter = new Transporter(this)

  //   const decorate = resolver => (...args) => {
  //     const iface = resolver(...args)
  //     transporter.add(iface)

  //     // iface.use(async (ctx, next) => {
  //     //   transit.req(ctx)
  //     //   const result = await next(ctx)
  //     //   transit.res(ctx)
  //     //   return result
  //     // })

  //     if (iface instanceof Interface.Ingress) {
  //       iface.use(this.middleware.map(m => m.ingress))
  //     } else if (iface instanceof Interface.Egress) {
  //       iface.use(this.middleware.map(m => m.egress))
  //     }

  //     return iface
  //   }

  //   const ingress = {
  //     at: decorate(Interface.Ingress.getResolver(this.transports))
  //   }

  //   const egress = {
  //     at: decorate(Interface.Egress.getResolver(this.transports))
  //   }

  //   const at = decorate(Interface.getResolver(this.transports))

  //   const api = { ingress, egress }

  //   init(api)

  //   return transporter
  // }

  transport(init) {
    const connect = new Interface()
    const transporter = new Transporter(this, connect)

    // transporter.add(connect)

    // connect.use(this.middleware)
    connect.ingress.use(this.middleware.map(m => m.ingress))
    connect.egress.use(this.middleware.map(m => m.egress))

    init(connect)
    // init(transport.interface)

    return transporter
  }
}
