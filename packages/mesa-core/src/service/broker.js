import invariant from 'invariant'
import { create as createService } from '.'
import { Service } from './service'

export class Broker {
  constructor(options = {}) {
    this.options = options
    this.registry = new Map()
    this.service = createService('broker')
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

  createService(options) {
    const service = createService(options)
    this.use(service)
    return service
  }

  get(name) {
    return this.registry.get(name)
  }

  call(...args) {
    return this.service.call(...args)
  }

  partial(...args) {
    return this.service.partial(...args)
  }

  plugin(name) {
    return service => this.use(name || service.name, service)
  }
}
