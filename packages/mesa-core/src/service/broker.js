import invariant from 'invariant'
import { create as createService } from '.'
import { Service } from './service'
import { getNodeID } from '../utils'

export class Broker {
  constructor(options = {}) {
    this.options = options
    this.nodeID = this.options.nodeID || getNodeID()

    // service registry
    this.registry = new Map()

    // TODO: configure logging from options
    this.logger = console

    const self = this
    this.service = createService(
      {
        name: 'broker',
        context: {
          broker: self,
          get logger() {
            return this.broker.logger
          }
        }
      },
      this.options
    )
  }

  plugin(plugin) {
    this.service.plugin(plugin)
    return this
  }

  use(name, service) {
    if (name instanceof Service) {
      service = name
      name = service.name
    }

    invariant(typeof name === 'string', 'Expected name to be a String')

    this.registry.set(name, service)
    this.service.use(name, service)

    return this
  }

  createService(schema, opts = {}) {
    const options = { ...this.options, ...opts }
    // schema.broker = this
    const service = createService(schema, options)

    // Setup service here

    this.use(service)
    return service
  }

  get(name) {
    return this.registry.get(name)
  }

  call(...args) {
    return this.service.call(...args)
  }
}
