import memoize from 'fast-memoize'
import { matchbox } from '@mesa/util'
import { Service } from './service'
import { Stack } from '../components/common'
import { Container, Handler, Router } from '../components'

export default options => new Namespace(options)

const defaultOptions = {
  router: {
    destructure: 'body'
  }
}

export class Namespace {
  constructor(options) {
    this.options = { ...defaultOptions, ...options }
    this.registry = matchbox(options.match)
    this.container = Container.spec({ namespace: this })
  }

  use(ns, component) {
    if (typeof component === 'undefined') {
      component = ns
      if (component instanceof Service) {
        component = component.getSpec()
      }
      this.container.use(component)
      return this
    }

    this.ns(ns).use(component)
    return this
  }

  action(pattern, component) {
    const handler = Handler.spec().use(component)

    if (typeof pattern === 'string') {
      pattern = { act: pattern }
    }

    defineHandler(this.registry, pattern, handler)

    return this
  }

  ns(namespace, options = {}) {
    if (Array.isArray(namespace)) {
      return namespace.reduce((result, ns) => result.ns(ns, opts), this)
    }

    const pattern =
      typeof namespace === 'string' ? { ns: namespace } : namespace

    const ns = new Namespace(options)

    defineHandler(this.registry, pattern, ns.router())

    return ns
  }

  match(pattern, strict) {
    return this.registry.match(pattern, strict)
  }

  router(options) {
    const match = memoize(msg => this.match(msg))
    const config = { match, ...this.options.router, ...options }

    return Stack.spec()
      .use(this.container)
      .use(Router.spec(config))
  }
}

function defineHandler(registry, pattern, handler) {
  const node = registry.define(pattern)

  if (!node.handlers) {
    node.handlers = []
  }

  node.handlers.unshift(handler)

  return node
}
