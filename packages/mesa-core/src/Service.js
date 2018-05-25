import EventEmitter from 'eventemitter3'
import uuidv1 from 'uuid/v1'
import { compose } from '@mesa/component'
import Container from './Container'
// import Namespace from './Namespace'

export class Service extends EventEmitter {

  constructor (namespace, options) {
    super('service')
    this.id = uuidv1()
    // this.namespace = Namespace.spec()
    this.options = options
    this.namespace = namespace
    this.container = Container.spec({ service: this })
  }

  /*
  * Extendability methods on, use, plugin
  */

  use (component) {
    if (component instanceof Service) {
      component = component.spec()
    }

    this.container.use(component)
    return this
  }

  plugin (plug) {
    plug(this)
    return this
  }

  /*
  * Service methods ns, accept, call
  */

  // ns (namespace) {
  //   const ns = new Namespace()
  //   const router = Router.spec({ match: msg => ns.match(msg) })
  //   this.namespace.accept(namespace, router)
  //   return ns
  // }

  // accept (pattern, component) {
  //   this.namespace.accept(pattern, component)
  //   return this
  // }

  ns (namespace, options) {
    return this.namespace.ns(namespace, options)
  }

  action (pattern, component) {
    this.namespace.action(pattern, component)
    return this
  }

  call (msg) {
    if (!this.handler) {
      this.handler = this.compose()
    }

    // Unhandled messages should return null
    return this.handler(msg, () => null)
  }

  start (...args) {
    this.emit('start', ...args)
    return this
  }

  /*
  * Utility methods compose, listen
  */

  spec () {
    return this.container
  }

  compose () {
    return compose(this.container, this) // IDEA: create context object to pass
  }

}

export default Service
