import invariant from 'invariant'

export default class Layer {
  constructor() {
    this.protocols = {}
  }

  use(protocol, init) {
    invariant(typeof init === 'function', 'Expected a function')

    this.protocols[protocol] = { init }
    return this
  }

  protocol(name) {
    return this.protocols[name]
  }

  make() {
    return new Transport(this)
  }

  build(service) {
    const throwNotImplmented = () => {
      throw new Error('Not Implemented')
    }

    return Object.entries(this.protocols).reduce(
      (layer, [protocol, transport]) => {
        const ingress = new Interface('listen').define(throwNotImplmented)
        const egress = new Interface('client').define(throwNotImplmented)

        transport.init(service, {
          ingress,
          egress
        })

        const iface = (layer[protocol] = {})

        ingress.apply(iface)
        egress.apply(iface)

        return layer
      },
      {}
    )
  }
}

class Transport {
  constructor(layer) {
    this.layer = layer
  }

  plugin() {
    return service => (this.transports = this.layer.build(service))
  }

  start(bootstrap) {
    invariant(this.transports, 'Calling start() before plugin has been used')

    function getTransport(protocol) {
      invariant(
        this.transports[protocol],
        `No protocol definition for ${protocol}`
      )
      return this.transports[protocol]
    }

    const listen = (protocol, ...args) => getTransport(protocol).listen(...args)
    const client = (protocol, ...args) => getTransport(protocol).client(...args)

    return bootstrap(this.transports, { listen, client })
  }
}

class Interface {
  constructor(name) {
    invariant(name, 'Must supply name')
    this.aliases = [name]
  }

  define(name, definition) {
    if (typeof name === 'string') {
      return this.alias(name).define(definition)
    } else {
      definition = name
    }

    this.definition = definition
    return this
  }

  alias(name) {
    this.aliases.push(name)
    return this
  }

  apply(iface) {
    this.aliases.forEach(name => {
      iface[name] = this.definition
    })
  }
}
