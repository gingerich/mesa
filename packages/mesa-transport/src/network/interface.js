import invariant from 'invariant'
import Connection from './connection'
import Connector from './connector'

export default class Interface extends Connector {
  static resolve(iface, ...args) {
    const connection = Connection.resolve(...args)
    connection.args = args
    return new this(iface, connection)
  }

  constructor(parent, connection) {
    super(connection)
    this.parent = parent
    this.connectors = []
    this.middleware = []
  }

  get ingress() {
    if (!this._ingress) {
      this._ingress = new Interface.Ingress(this)
      this.add(this._ingress)
    }

    return this._ingress
  }

  get egress() {
    if (!this._egress) {
      this._egress = new Interface.Egress(this)
      this.add(this._egress)
    }

    return this._egress
  }

  use(...middleware) {
    this.middleware = this.middleware.concat(...middleware)
    return this
  }

  add(connector) {
    if (typeof connector === 'function') {
      connector = connector(this)
    }

    invariant(connector instanceof Connector, 'expected instance of Connector')

    this.connectors.push(connector)

    return connector
  }

  resolve(connection) {
    const iface = new Interface(this, connection)
    // Order matters here
    // egress should connect first to ensure service.use() called before ingress can service.call()
    iface.egress.at(connection)
    iface.ingress.at(connection)
    return iface
  }

  at(protocol, ...args) {
    const connection = Connection.resolve(protocol, ...args)
    connection.args = args
    const iface = this.resolve(connection)
    this.add(iface)
    return iface
  }

  connector(resolve, transit) {
    return service => {
      return Promise.all(
        this.connectors.map(c => c.connector(resolve, transit)(service))
      )
    }
  }
}

Interface.Ingress = require('./ingress')
Interface.Egress = require('./egress')
