"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Namespace = void 0;

var _component = require("@mesa/component");

var _util = require("@mesa/util");

var _Component = _interopRequireDefault(require("./Component"));

var _Handler = _interopRequireDefault(require("./Handler"));

var _Stack = _interopRequireDefault(require("./common/Stack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Namespace extends _Component.default {
  static destructure(key) {
    return Namespace.spec({
      destructure: key
    });
  }

  static isolated(config) {
    return Namespace.spec(_objectSpread({}, config, {
      isolated: true
    }));
  } // getHandler (msg) {
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


  compose(substream) {
    const {
      destructure,
      balanceComponent = _Stack.default.spec()
    } = this.config;
    return (msg, next) => {
      // let [ns, ...payload] = Array.isArray(msg) ? msg : [msg]
      // if (!payload.length) payload = ns
      // Pass msg through any middleware
      // msg = substream(this.config.subcomponents)(msg)
      // Lookup handlers for msg
      const match = this.config.match(msg); // No handlers to accept msg

      if (!match) {
        return next(msg);
      } // Optionally destructure msg


      const {
        [destructure]: payload
      } = msg;

      if (payload) {
        msg = payload;
      } // const handler = balanceComponent.use(match.node.handlers)


      const handler = substream(match.node.handlers);
      return handler(msg); // We don't pass next at the namespace level

      return substream(handler)(msg);
    };
  }

}

exports.Namespace = Namespace;
Namespace.Spec = class NamespaceSpec extends _component.Spec {
  constructor(type, config, subcomponents) {
    super(type, config, subcomponents);
    this.registry = (0, _util.matchbox)({
      nested: true
    });
    const {
      strict = false
    } = this.config;

    this.config.match = msg => this.registry.match(msg, strict);
  }

  accept(pattern, component) {
    // if (Array.isArray(pattern)) {
    //   const pivotArray = arr => arr.length === 1 ?
    //     [{}, ...arr] : [...arr.slice(-1), ...arr.slice(0, -1)]
    //   const [p, ...namespaces] = pivotArray(pattern)
    //   this.ns(namespaces).accept(p, component)
    //   return this
    // }
    const handler = _Handler.default.spec().use(component);

    defineHandler(this.registry, pattern, handler);
    return this;
  }

  actor(pattern, component) {
    return this.accept(pattern, component);
  }

  ns(namespace, opts) {
    if (Array.isArray(namespace)) {
      return namespace.reduce((result, ns) => result.ns(ns, opts), this);
    }

    const pattern = typeof namespace !== 'object' ? {
      ns: namespace
    } : namespace;
    const ns = Namespace.spec(opts);
    defineHandler(this.registry, pattern, ns);
    return ns;
  }

};

function defineHandler(registry, pattern, handler) {
  const node = registry.define(pattern);

  if (!node.handlers) {
    node.handlers = [];
  }

  node.handlers.unshift(handler);
  return node;
}

var _default = Namespace;
exports.default = _default;