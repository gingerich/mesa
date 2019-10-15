import { uuid } from '@mesa/util'
import { Namespace } from './namespace'
import { ServiceRegistry } from './registry'
import ServiceFactory from './factory'

export class ServiceBroker {
  constructor(options = {}) {
    this.options = options
    this.id = uuid()
    this.registry = new ServiceRegistry()

    // root-level namespace
    this.namespace = new Namespace({ nested: true })

    // TODO: configure logging from options
    this.logger = console

    const self = this
    this.service = new ServiceFactory(this.namespace, {
      name: `broker-${this.id}`,
      context: {
        broker: self,
        get logger() {
          return this.broker.logger
        }
      }
    })
  }

  plugin(plugin) {
    this.service.plugin(plugin)
    return this
  }

  use(...middleware) {
    this.service.use(...middleware)
    return this
  }

  createService(schema, opts = {}) {
    const namespace = this.namespace.ns(schema.name)
    const service = new ServiceFactory(namespace, schema)
    this.registry.add(service.schema, service)
    return service
  }

  getService(schema) {
    return this.registry.get(schema)
  }

  getServiceByName(name) {
    return this.registry.getByName(name)
  }

  call(...args) {
    return this.service.call(...args)
  }
}

ServiceBroker.prototype.MESA_VERSION = ServiceBroker.MESA_VERSION = require('../../package.json').version
