'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Namespace = void 0

var _util = require('@mesa/util')

var _components = require('../components')

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {}
    var ownKeys = Object.keys(source)
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(
        Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable
        })
      )
    }
    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key])
    })
  }
  return target
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    })
  } else {
    obj[key] = value
  }
  return obj
}

function defineHandler(registry, pattern, handler) {
  const node = registry.define(pattern)

  if (!node.handlers) {
    node.handlers = []
  }

  node.handlers.unshift(handler)
  return node
}

class Namespace {
  constructor(options) {
    this.options = options
    this.registry = (0, _util.matchbox)(options.match)
  }

  action(pattern, component) {
    const handler = _components.Handler.spec().use(component)

    defineHandler(this.registry, pattern, handler)
    return this
  }

  ns(namespace, options = {}) {
    if (Array.isArray(namespace)) {
      return namespace.reduce((result, ns) => result.ns(ns, opts), this)
    }

    const pattern =
      typeof namespace !== 'object'
        ? {
            ns: namespace
          }
        : namespace
    const ns = new Namespace(options)
    defineHandler(this.registry, pattern, ns.router())
    return ns
  }

  match(pattern, strict) {
    return this.registry.match(pattern, strict)
  }

  router(options) {
    const match = msg => this.match(msg)

    return _components.Router.spec(
      _objectSpread(
        {
          match
        },
        this.options.router,
        options
      )
    )
  }
}

exports.Namespace = Namespace

var _default = options => new Namespace(options)

exports.default = _default
