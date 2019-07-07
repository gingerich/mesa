import invariant from 'invariant'
import Mesa from '@mesa/core'

class Connector {
  static resolve(value) {
    if (value instanceof Connector) {
      return value
    }

    if (typeof value === 'function') {
      return class extends Connector {
        connector(resolve, transit) {
          return value(resolve, transit)
        }
      }
    }

    throw new Error(`Cannot resolve ${value} to Connector`)
  }

  constructor(connection) {
    this.connection = connection
  }

  connector(/* resolve,  transit */) {
    throw new Error('Not Implemented')
  }
}

export class Interface extends Connector {
  // static connector() {
  //   return iface => new this(iface.connection)
  // }

  static resolve(iface, ...args) {
    const connection = Connection.resolve(...args)
    connection.args = args
    return new this(iface, connection)
  }

  constructor(parent, connection) {
    super(connection)
    // this.transport = transport
    this.parent = parent
    this.connectors = []
    this.middleware = []
  }

  use(...middleware) {
    this.middleware = this.middleware.concat(...middleware)
    return this
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

  add(connector) {
    if (typeof connector === 'function') {
      connector = connector(this)
    }

    invariant(connector instanceof Connector, 'expected instance of Connector')

    this.connectors.push(connector)

    return connector
  }

  resolve(connection) {
    return new Interface(this, connection)
  }

  at(...args) {
    const connection = Connection.resolve(...args)
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

Interface.Ingress = class Ingress extends Interface {
  static get Connector() {
    return class extends Connector {
      connector(resolve) {
        return service => {
          const transport = resolve(this.connection)
          return transport.ingress(service)
        }
      }
    }
  }

  at(...args) {
    super.at(...args)
    return this
  }

  resolve(connection) {
    return new Ingress.Connector(connection)
  }

  connector(resolve, transit) {
    return service => {
      const s = Mesa.createService('123')
        .use(this.parent.middleware)
        .use(this.middleware)
        .use(transit.ingress())
        .use(ctx => service.call(ctx.msg))

      // transport = resolve(this.connection)
      // transport.ingress(s)

      return super.connector(resolve, transit)(s)
    }
  }
}

Interface.Egress = class Egress extends Interface {
  connector(resolve, transit) {
    return service => {
      const s = Mesa.createService('321')
        .use(this.parent.middleware)
        .use(this.middleware)
        .use(transit.egress())

      // service.use(s)

      // const transport = resolve(this.connection)

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

export function getResolver(transports) {
  return connection => {
    const { protocol } = connection
    const name = protocol.slice(0, protocol.indexOf(':'))
    const transport = transports[name]

    invariant(transport, `No protocol definition for ${name}`)

    return transport(connection)
  }
}

// export class Interface {
//   static getResolver(transports) {
//     return (...args) => {
//       const connection = Connection.resolve(...args)
//       connection.args = args

//       const { protocol } = connection
//       const name = protocol.slice(0, protocol.indexOf(':'))
//       const transport = transports[name]

//       invariant(transport, `No protocol definition for ${name}`)

//       return new this(transport, connection)
//     }
//   }

//   constructor(transport, connection) {
//     this.transport = transport
//     this.connection = connection
//     this.middleware = []
//   }

//   use(...middleware) {
//     this.middleware = this.middleware.concat(...middleware)
//     return this
//   }

//   // connect(/* service, options, transit */) {
//   //   throw new Error('Not Implemented')
//   // }

//   // connect(connection) {
//   //   return this.transport.connect(connection)
//   // }
// }

// Interface.Ingress = class Ingress extends Interface {
//   connect(service) {
//     const s = Mesa.createService('123')
//       .use(this.middleware)
//       .use(ctx => service.call(ctx.msg))

//     return this.transport.ingress(s, this.connection)
//   }
// }

// Interface.Egress = class Egress extends Interface {
//   constructor() {
//     this.actions = []
//   }

//   connect(service) {
//     const s = Mesa.createService('321').use(this.middleware)
//     // .use(transit.egress())
//     service.use(s)

//     if (!this.actions.length) {
//       return this.transport.egress(s, this.connection)
//     }

//     const connections = this.actions.map(action =>
//       this.transport.egress(s, this.connection, action)
//     )

//     return Promise.all(connections)
//   }

//   action(...actions) {
//     this.actions.push(...actions)
//   }
// }

export class Connection {
  static resolve(connection, options = {}) {
    if (typeof connection === 'object') {
      return connection
    }

    if (typeof options === 'number') {
      options = { port: options }
    }

    if (typeof connection === 'string') {
      try {
        const url = new URL(connection)
        return {
          protocol: url.protocol,
          username: url.username,
          password: url.password,
          host: url.host,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          search: url.search,
          searchParams: url.searchParams,
          hash: url.hash,
          origin: url.origin,
          href: url.href,
          ...options
        }
      } catch (e) {
        return { protocol: connection, ...options }
      }
    }
  }

  static getResolver(transports) {
    return (...args) => {
      const connection = Connection.resolve(...args)
      connection.args = args

      const { protocol } = connection
      const name = protocol.slice(0, protocol.indexOf(':'))
      const transport = transports[name]

      invariant(transport, `No protocol definition for ${name}`)

      return new this(transport, connection)
    }
  }
}
