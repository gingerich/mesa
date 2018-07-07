import EventEmitter from 'eventemitter3'
import uuidv1 from 'uuid/v1'
import { compose } from '@mesa/component'
import Container from './Container'

const context = {
  call(...args) {
    return this.service.call(...args)
  },
  defer() {
    return this.msg
  }
}

export class Service extends EventEmitter {

  constructor (namespace, options) {
    super('service')
    this.id = uuidv1()
    this.options = options
    this.namespace = namespace
    this.container = Container.spec({ service: this })
    this.context = Object.create(context)
  }

  /*
  * Extendability methods
  */

  use (component) {
    if (component instanceof Service) {
      component = component.getSpec()
    }

    this.container.use(component)
    return this
  }

  plugin (plug) {
    plug(this)
    return this
  }

  /*
  * Service methods
  */

  ns (namespace, options) {
    return this.namespace.ns(namespace, options)
  }

  action (pattern, component) {
    this.namespace.action(pattern, component)
    return this
  }

  call (msg, ...parts) {
    if (!this.handler) {
      this.handler = this.compose()
    }

    if (parts.length) {
      msg = [msg, ...parts]
    }

    const ctx = this.createContext(msg)

    // Unhandled messages should return null
    return this.handler(ctx, () => null)
  }

  createContext(msg) {
    const context = Object.create(this.context)
    context.service = this
    context.msg = msg
    return context
  }

  /*
  * Utility methods
  */

  createContext(msg) {
    const context = Object.create(this.context)
    context.service = this
    context.msg = msg
    return context
  }

  getSpec () {
    return this.container
  }

  start (...args) {
    this.emit('start', ...args)
    return this
  }

  compose () {
    return compose(this.container, this) // IDEA: create context object to pass
  }

}

export default Service
