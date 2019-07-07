import memoize from 'mem'
import invariant from 'invariant'
import { once, EventEmitter } from 'events'
import { getResolver } from './network'
import { Transit } from './transit'

export default class Transporter extends EventEmitter {
  static getResolver(layer) {
    return connection => {
      const { protocol } = connection
      const name = protocol.slice(0, protocol.indexOf(':'))
      const transport = layer.transports[name]

      invariant(transport, `No protocol definition for ${name}`)

      return transport(connection)
    }
  }

  constructor(layer, iface) {
    super()
    this.layer = layer
    this.interface = iface
  }

  plugin() {
    return service => {
      // memoize resolver so same transport instance per unique connection
      const resolve = memoize(Transporter.getResolver(this.layer))
      const transit = new Transit(this)
      const connect = this.interface.connector(resolve, transit)

      this.once('connect', options => {
        const connected = connect(
          service,
          options
        )

        Promise.resolve(connected).then(
          results => this.emit('connected', results),
          err => this.emit('error', err)
        )
      })
    }
  }

  add(iface) {
    this.interface.add(iface)
    return this
  }

  connect(options) {
    const connected = once(this, 'connected')
    this.emit('connect', options)
    return connected
  }
}
