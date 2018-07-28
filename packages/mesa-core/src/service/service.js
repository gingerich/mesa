import EventEmitter from 'eventemitter3'
import uuidv1 from 'uuid/v1'
import { compose } from '@mesa/component'
import { Message } from './message'

const context = {
  call(...args) {
    return this.service.call(...args)
  },
  defer() {
    return this.msg
  }
}

export class Service extends EventEmitter {
  constructor(namespace, options) {
    super('service')
    this.namespace = namespace
    this.options = options
    this.name = options.name
    this.id = uuidv1()
    this.context = Object.create(context)
  }

  /*
  * Extendability methods
  */

  use(ns, component) {
    this.namespace.use(ns, component)
    return this
  }

  plugin(plug, cb) {
    const result = plug(this)
    if (cb) {
      cb(result)
    }
    return this
  }

  /*
  * Service methods
  */

  ns(namespace, options) {
    return this.namespace.ns(namespace, options)
  }

  action(pattern, component) {
    this.namespace.action(pattern, component)
    return this
  }

  call(...args) {
    if (!this.handler) {
      this.handler = this.compose()
    }

    const message = Message.from(...args)
    const ctx = this.createContext(message.value)

    // Unhandled messages should return null
    return this.handler(ctx, () => null)
  }

  partial(...args) {
    return this.call.bind(this, ...args)
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

  toComponent() {
    return this.namespace.router()
  }

  compose() {
    return compose(
      this.toComponent(),
      this
    )
  }
}
