import { create } from '.'
import { Service } from './service'

export class Broker {
  constructor() {
    this.registry = {}
    this.service = create('broker')
  }

  use(name, service) {
    if (name instanceof Service) {
      service = name
      name = service.name
    }

    // invariant(typeof name === 'string', 'name must be a String')

    this.registry[name] = service
    this.service.use(name, service)

    return this
  }

  createService(options) {
    const service = create(options)
    this.use(service)
    return service
  }

  get(name) {
    return this.registry[name]
  }

  plugin(name) {
    return service => this.use(name || service.name, service)
  }

  call(...args) {
    return this.service.call(...args)
  }
}
