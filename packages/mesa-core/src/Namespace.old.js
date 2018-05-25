import { Spec, compose } from '@mesa/component'
import { matchbox } from '@mesa/util' 
import Component from './Component'
import Handler from './Handler'
import Stack from './common/Stack'

export class Namespace extends Component {

  static destructure (key) {
    return Namespace.spec({ destructure: key })
  }

  static isolated (config) {
    return Namespace.spec({ ...config, isolated: true })
  }

  // getHandler (msg) {
  //   const match = this.config.match(msg)
  //   // const match = this.config.registry.match(msg)
  //   if (match) {
  //     return match.node.handler
  //   }
  // }

  // call (msg) {
  //   return this.mesa.call(msg)
  // }

  // defer (msg) {
  //   if (!this.next) {
  //     return Promise.resolve(msg)
  //   }
  //   return this.next(msg)
  // }

  // getChildContext () {
  //   return this.config.isolated ? this : this.context
  // }

  compose (substream) {
    const { destructure, balanceComponent = Stack.spec() } = this.config

    return (msg, next) => {
      // let [ns, ...payload] = Array.isArray(msg) ? msg : [msg]
      // if (!payload.length) payload = ns

      // Pass msg through any middleware
      // msg = substream(this.config.subcomponents)(msg)

      // Lookup handlers for msg
      const match = this.config.match(msg)

      // No handlers to accept msg
      if (!match) {
        return next(msg)
      }

      // Optionally destructure msg
      const { [destructure]: payload } = msg
      if (payload) {
        msg = payload
      }

      // const handler = balanceComponent.use(match.node.handlers)
      const handler = substream(match.node.handlers)
      return handler(msg)

      // We don't pass next at the namespace level
      return substream(handler)(msg)
    }
  }
}

Namespace.Spec = class NamespaceSpec extends Spec {
  constructor (type, config, subcomponents) {
    super(type, config, subcomponents)
    this.registry = matchbox({ nested: true })

    const { strict = false } = this.config
    this.config.match = msg => this.registry.match(msg, strict)
  }

  accept (pattern, component) {
    // if (Array.isArray(pattern)) {
    //   const pivotArray = arr => arr.length === 1 ?
    //     [{}, ...arr] : [...arr.slice(-1), ...arr.slice(0, -1)]

    //   const [p, ...namespaces] = pivotArray(pattern)

    //   this.ns(namespaces).accept(p, component)

    //   return this
    // }

    const handler = Handler.spec().use(component)

    defineHandler(this.registry, pattern, handler)

    return this
  }

  actor (pattern, component) {
    return this.accept(pattern, component)
  }

  ns (namespace, opts) {
    if (Array.isArray(namespace)) {
      return namespace.reduce((result, ns) => result.ns(ns, opts), this)
    }

    const pattern = typeof namespace !== 'object' ? { ns: namespace } : namespace

    const ns = Namespace.spec(opts)

    defineHandler(this.registry, pattern, ns)

    return ns
  }
}

function defineHandler (registry, pattern, handler) {
  const node = registry.define(pattern)

  if (!node.handlers) {
    node.handlers = []
  }

  node.handlers.unshift(handler)

  return node
}

export default Namespace
