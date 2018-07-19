'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.Handler = void 0

var _component = require('@mesa/component')

class Handler extends _component.Component {
  compose(stack) {
    const middleware = stack()
    return async (ctx, next) => {
      const originalDefer = ctx.defer
      ctx.defer = next.bind(ctx)
      const result = await middleware(ctx, next)
      ctx.defer = originalDefer
      return result
    }
  }
}

exports.Handler = Handler
