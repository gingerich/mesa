import EventEmitter from 'eventemitter3'
import uuidv1 from 'uuid/v1'
import { compose } from '@mesa/component'
import { Message } from './message'
import { Container } from '../components'

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
    this.id = uuidv1()
    this.options = options
    this.name = options.name
    this.namespace = namespace
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

  getSpec() {
    return this.namespace.router()
  }

  compose() {
    return compose(
      this.getSpec(),
      this
    )
  }
}

export default Service
