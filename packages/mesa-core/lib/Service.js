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

const context = {
  call(...args) {
    return this.service.call(...args);
  },

  defer() {
    return this.msg;
  }

};

class Service extends _eventemitter.default {
  constructor(namespace, options) {
    super('service');
    this.id = (0, _v.default)();
    this.options = options;
    this.namespace = namespace;
    this.container = _Container.default.spec({
      service: this
    });
    this.context = Object.create(context);
  }
  /*
  * Extendability methods
  */


  use(component) {
    if (component instanceof Service) {
      component = component.getSpec();
    }

    this.container.use(component);
    return this;
  }

  plugin(plug) {
    plug(this);
    return this;
  }
  /*
  * Service methods
  */


  ns(namespace, options) {
    return this.namespace.ns(namespace, options);
  }

  action(pattern, component) {
    this.namespace.action(pattern, component);
    return this;
  }

  call(msg, ...parts) {
    if (!this.handler) {
      this.handler = this.compose();
    }

    if (parts.length) {
      msg = [msg, ...parts];
    }

    const ctx = this.createContext(msg); // Unhandled messages should return null

    return this.handler(ctx, () => null);
  }

  createContext(msg) {
    const context = Object.create(this.context);
    context.service = this;
    context.msg = msg;
    return context;
  }
  /*
  * Utility methods
  */


  createContext(msg) {
    const context = Object.create(this.context);
    context.service = this;
    context.msg = msg;
    return context;
  }

  getSpec() {
    return this.container;
  }

  start(...args) {
    this.emit('start', ...args);
    return this;
  }

  compose() {
    return (0, _component.compose)(this.container, this); // IDEA: create context object to pass
  }

}

exports.Service = Service;
var _default = Service;
exports.default = _default;