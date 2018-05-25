"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Service = void 0;

var _eventemitter = _interopRequireDefault(require("eventemitter3"));

var _v = _interopRequireDefault(require("uuid/v1"));

var _component = require("@mesa/component");

var _Container = _interopRequireDefault(require("./Container"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Namespace from './Namespace'
class Service extends _eventemitter.default {
  constructor(namespace, options) {
    super('service');
    this.id = (0, _v.default)(); // this.namespace = Namespace.spec()

    this.options = options;
    this.namespace = namespace;
    this.container = _Container.default.spec({
      service: this
    });
  }
  /*
  * Extendability methods on, use, plugin
  */


  use(component) {
    if (component instanceof Service) {
      component = component.spec();
    }

    this.container.use(component);
    return this;
  }

  plugin(plug) {
    plug(this);
    return this;
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


  ns(namespace, options) {
    return this.namespace.ns(namespace, options);
  }

  action(pattern, component) {
    this.namespace.action(pattern, component);
    return this;
  }

  call(msg) {
    if (!this.handler) {
      this.handler = this.compose();
    } // Unhandled messages should return null


    return this.handler(msg, () => null);
  }

  start(...args) {
    this.emit('start', ...args);
    return this;
  }
  /*
  * Utility methods compose, listen
  */


  spec() {
    return this.container;
  }

  compose() {
    return (0, _component.compose)(this.container, this); // IDEA: create context object to pass
  }

}

exports.Service = Service;
var _default = Service;
exports.default = _default;