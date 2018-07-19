'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Params = void 0

var _core = _interopRequireDefault(require('@mesa/core'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

class Params extends _core.default.Component {
  constructor(config) {
    super(config)
    this.params = config.params || {}
  }

  paramHandlers(params) {
    const handlers = params
      .filter(param => !!this.params[param.name])
      .map(param => this.params[param.name])
    return Array.prototype.concat.apply([], handlers)
  }

  compose() {
    return async (ctx, next) => {
      if (!ctx.parsedPath) {
        throw new Error(
          'Missing ctx.parsedPath. You probably meant to use the Path component preceeding Params'
        )
      }

      const { params, args } = ctx.parsedPath
      const handlers = this.paramHandlers(params)

      if (handlers.length) {
        await Promise.all(handlers.map(fn => fn(ctx, ...args)))
      }

      return next(ctx)
    }
  }
}

exports.Params = Params
var _default = Params
exports.default = _default
