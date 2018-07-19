'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Component = void 0

var _invariant = _interopRequireDefault(require('invariant'))

var _lodash = _interopRequireDefault(require('lodash.get'))

var _util = require('@mesa/util')

var _Spec = _interopRequireDefault(require('./Spec'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

const debug = require('debug')('mesa:component')

class Component {
  static spec(config, factory = this) {
    const Specification = this.Spec || class extends _Spec.default {} // Apply plugins
    ;(0, _util.extension)(this.plugins).extend(Specification)
    return new Specification(factory, config)
  }

  static of(source) {
    if (source instanceof this) {
      return source
    } else if (typeof source === 'function') {
      return class extends this {
        compose() {
          return source(this.config, this.context)
        }
      }
    } else {
      throw new Error(`Cannot componentize unexpected type ${typeof source}`)
    }
  }

  static functional(fn) {
    return class extends this {
      compose() {
        return fn(this.config, this.context)
      }
    }
  }

  constructor(config, context) {
    this.config = Object.assign(_lodash.default.bind(null, config), config)
    this.context = context
  }

  componentWillMount() {
    // Component lifecycle method
  }

  componentDidMount() {} // Component lifecycle method

  /*
   * Return middleware function (See http://koajs.com)
   */

  compose() {
    throw new Error(`${this.constructor.name} must implement compose()`)
  }

  toJSON() {
    return JSON.stringify(this.constructor.name)
  }
}

exports.Component = Component
var _default = Component
exports.default = _default
