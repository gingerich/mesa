import memoize from 'mem'
import { once, EventEmitter } from 'events'
import { Transit } from './transit'
import { getResolver } from './network'

export default class Transporter extends EventEmitter {
  constructor(layer, iface) {
    super()
    this.layer = layer
    this.interface = iface
    // this.connectors = []
  }

  plugin() {
    return service => {
      // const service = broker.service

      // const connectors = this.plugins.map(plugin => plugin(service))
      // this.once('connect', options => {
      //   const p = connectors.map(connector => connector(options))
      //   Promise.all(p).then(
      //     results => this.emit('connected', results),
      //     err => this.emit('error', err)
      //   )
      // })

      // memoize so same transport instance returned for same connection
      const resolve = memoize(getResolver(this.layer.transports))
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

        // const connections = this.connectors.map(connect =>
        //   connect(
        //     service,
        //     options,
        //     transit
        //   )
        // )
        // Promise.all(connections).then(
        //   results => this.emit('connected', results),
        //   err => this.emit('error', err)
        // )
      })
    }
    // return service => this.plugins.forEach(service.plugin.bind(service))
    // return service => {
    //   const onConnect = plugin => plugin(service)
    //   this.plugins.forEach(plugin => {
    //     this.once('connect', options => {
    //       plugin(service, options)
    //     })
    //   })
    //   this.once('connect', () => this.plugins.forEach(onConnect))
    // }
  }

  add(iface) {
    // const onConnect = options => {
    //   iface.connect(
    //     service,
    //     options
    //   )
    // }

    // this.once('connect', iface.connect.bind(iface))
    // this.connectors.push(iface.connect.bind(iface))
    this.interface.add(iface)

    // this.plugins.push(service => {
    //   iface.connector(service)
    // })

    // this.plugins.push((service, options) => {
    //   iface.connect(service, options)
    //   // this.once('connect', onConnect)
    // })
  }

  connect(options) {
    const connected = once(this, 'connected')
    this.emit('connect', options)
    return connected
  }
}
