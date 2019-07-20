import invariant from 'invariant'
import Transporter from './transporter'
import Network from './network'

export default class Layer {
  constructor() {
    this.transports = {}
    this.middleware = []
  }

  protocol(name, transport) {
    invariant(typeof transport === 'function', 'Expected a function')

    this.transports[name] = transport
    return this
  }

  use(...middleware) {
    this.middleware.push(
      ...[]
        .concat(...middleware)
        .map(m => (typeof m === 'function' ? { ingress: m, egress: m } : m))
    )

    return this
  }

  transporter(init) {
    const connect = new Network.Interface()
    const transporter = new Transporter(this, connect)

    connect.ingress.use(this.middleware.map(m => m.ingress))
    connect.egress.use(this.middleware.map(m => m.egress))

    init(connect)

    return transporter
  }
}
