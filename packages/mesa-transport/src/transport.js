import invariant from 'invariant'

class Transport {
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
    let transport

    function plugin() {
      return service => (transport = self.build(service))
    }

    plugin.start = function(bootstrap) {
      invariant(transport, 'Calling start() before plugin has been used')
      return bootstrap(transport)
    }

    return plugin
  }

  build(service) {
    const transports = Object.entries(this.protocols).reduce(
      (layer, [protocol, transport]) => {
        layer[protocol] = {
          listen() {
            throw new Error('Not Implemented')
          },
          client() {
            throw new Error('Not Implemented')
          }
        }

        function setterForKey(key) {
          return val => (layer[protocol][key] = val)
        }

        transport.init({
          service,
          listen: setterForKey('listen'),
          client: setterForKey('client')
        })

        return layer
      },
      {}
    )

    function getTransport(protocol) {
      invariant(transports[protocol], `No protocol definition for ${protocol}`)
      return transports[protocol]
    }

    const listen = (protocol, ...args) => getTransport(protocol).listen(...args)
    const client = (protocol, ...args) => getTransport(protocol).client(...args)

    return { transports, listen, client }
  }
}

export default Transport
