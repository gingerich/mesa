import { uuid } from '@mesa/util'
import ServiceFactory from './factory'
import { Namespace } from './namespace'

export class Broker {
  constructor(options = {}) {
    this.options = options
    this.id = uuid()

    // root-level namespace
    this.namespace = new Namespace({ nested: true })

    // service registry
    this.registry = new Map()

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
    this.registry.set(schema.name, service)
    return service
  }

  get(name) {
    return this.registry.get(name)
  }

  call(...args) {
    return this.service.call(...args)
  }
}
