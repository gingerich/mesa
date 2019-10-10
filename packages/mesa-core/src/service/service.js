import EventEmitter from 'eventemitter3'
import uuidv1 from 'uuid/v1'
import { compose } from '@mesa/component'
import * as Context from './context'
import { Message } from './message'
import { Hooks } from './hook'
import { UnhandledMessageError } from './errors'
import { Config } from '../components'
import { Stack } from '../components/common'

const defaultHandler = () => UnhandledMessageError.reject() //  Message.UNHANDLED

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

  action(pattern, component, options) {
    this.namespace.action(pattern, component, options)
    return this
  }

  handle(ctx, next) {
    if (!this._handler) {
      this._handler = this.compose()
    }
    return this._handler(ctx, next)
  }

  // call('foo.test', payload, { fallback })
  // call({ a: 1 }, { fallback })
  // call('foo.test', payload)
  // call({ a: 1 })
  call(action, msg, opts) {
    const parts = [action]

    if (typeof action === 'object' && opts === undefined) {
      opts = msg
      msg = null
    }

    if (msg !== null) {
      parts.push(msg)
    }

    const message = Message.from(...parts)

    const ctx = this.createContext(message, opts)

    return this.handle(ctx, defaultHandler) // defaultHandler could be optional param in opts

    // const callback = args[args.length - 1]
    // if (typeof callback === 'function') {
    //   result.then(data => callback(ctx, data))
    // }

    // return result
  }

  emit(...args) {
    const message = Message.from(...args)

    const ctx = this.createContext(message)
    ctx.cmd = 'event'

    return this.handle(ctx)
  }

  /*
  * Utility methods
  */

  createContext(message, opts = {}) {
    if (opts.ctx) {
      const ctx = opts.ctx
      ctx.msg = message.body
      // ctx.nodeID = this.broker.nodeID
      return ctx
    }

    return Context.create(this, message.body, this.schema.context, opts)
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
