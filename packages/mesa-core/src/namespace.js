import { matchbox } from '@mesa/util'
import Handler from './Handler'
import Router from './Router'

function defineHandler (registry, pattern, handler) {
  const node = registry.define(pattern)

  if (!node.handlers) {
    node.handlers = []
  }

  node.handlers.unshift(handler)

  return node
}

export class Namespace {
  constructor (options) {
    this.options = options
    this.registry = matchbox({ nested: options.nested })
  }

  action (pattern, component) {
    const handler = Handler.spec().use(component)

    defineHandler(this.registry, pattern, component)

    return this
  }

  ns (namespace, options = {}) {
    if (Array.isArray(namespace)) {
      return namespace.reduce((result, ns) => result.ns(ns, opts), this)
    }

    const pattern = typeof namespace !== 'object' ? { ns: namespace } : namespace

    const ns = new Namespace(options)

    defineHandler(this.registry, pattern, ns.router())

    return ns
  }

  match (pattern, strict) {
    return this.registry.match(pattern, strict)
  }

  router (options) {
    const match = msg => this.match(msg)
    return Router.spec({ match, ...options })
  }
}

export default (options) => new Namespace(options)