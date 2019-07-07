import EventEmitter from 'eventemitter3'
import uuidv1 from 'uuid/v1'
import { compose } from '@mesa/component'
import * as Context from './context'
import { Message } from './message'
import { Hooks } from './hook'
import { Config } from '../components'
import { Stack } from '../components/common'

export class Service extends EventEmitter {
  constructor(namespace, schema) {
    super('service')
    this.id = uuidv1()
    this.namespace = namespace
    this.schema = schema
    this.name = schema.name
    this.config = schema.config
    this.hooks = new Hooks()
    // this.context = Context.extend(schema.context)
  }

  /*
  * Extendability methods
  */

  use(ns, component) {
    this.namespace.use(ns, component)
    return this
  }

  stack(...middleware) {
    const stack = Stack.spec().use(...middleware)
    this.use(stack)
    return stack
  }

  plugin(plug, cb) {
    const result = plug(this)
    if (cb) {
      cb(result)
    }
    return this
  }

  // registerHook(name, component) {
  //   this.hooks.register(name, componentn)
  //   const { [name]: hook = [] } = this.hooks
  //   hook.push(component)
  // }

  // getHook(name) {
  //   const { [name]: hook = [] } = this.hooks
  //   return compose(hook)
  // }

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

    const ctx = this.createContext(message.payload)

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
    return Context.create(this, msg, this.schema.context)
    // return this.context.create(this, msg)
  }

  toComponent() {
    return Config.spec(this.config).use(this.namespace.router())
  }

  compose() {
    return compose(
      this.toComponent(),
      this
    )
  }
}
