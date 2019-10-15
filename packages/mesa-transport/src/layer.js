import invariant from 'invariant'
import Transporter from './transporter'
import Network from './network'

export default class Layer {
  constructor() {
    this.transports = {}
    this.plugins = []
  }

  protocol(name, transport) {
    invariant(typeof transport === 'function', 'Expected a function')

    this.transports[name] = transport
    return this
  }

  use(...plugins) {
    this.plugins = this.plugins.concat(...plugins)
    return this
  }

  transporter(init) {
    const connect = new Network.Interface()
    const transporter = new Transporter(this, connect)

    this.plugins.forEach(plugin => plugin(connect, this))

    init(connect)

    return transporter
  }
}
