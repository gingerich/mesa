import invariant from 'invariant'

export default class Transport {
  constructor() {
    this.protocols = {}
  }

  use(protocol, init) {
    if (typeof init !== 'function') {
      throw new Error('Expected a function')
    }

    this.protocols[protocol] = { init }
    return this
  }

  protocol(name) {
    return this.protocols[name]
  }

  makePlugin() {
    const self = this
    let transports

    function plugin() {
      return service => (transports = self.build(service))
    }

    plugin.start = function(bootstrap) {
      invariant(transports, 'Calling start() before plugin has been used')

      function getTransport(protocol) {
        invariant(
          transports[protocol],
          `No protocol definition for ${protocol}`
        )
        return transports[protocol]
      }

      const listen = (protocol, ...args) =>
        getTransport(protocol).listen(...args)
      const client = (protocol, ...args) =>
        getTransport(protocol).client(...args)

      return bootstrap(transports, { listen, client })
    }

    return plugin
  }

  build(service) {
    return Object.entries(this.protocols).reduce(
      (layer, [protocol, transport]) => {
        const throwNotImplmented = () => {
          throw new Error('Not Implemented')
        }

        const ingress = new Interface('listen').define(throwNotImplmented)
        const egress = new Interface('client').define(throwNotImplmented)

        transport.init({
          service,
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

class Interface {
  constructor(name) {
    invariant(name, 'Must supply name')
    this.aliases = [name]
  }

  define(definition) {
    this.definition = definition
    return this
  }

  alias(name) {
    this.aliases.push(name)
    return this
  }

  apply(protocol) {
    this.aliases.forEach(name => {
      protocol[name] = this.definition
    })
  }
}
