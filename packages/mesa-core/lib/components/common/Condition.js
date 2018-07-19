'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Branch = exports.Condition = void 0

var _component = require('@mesa/component')

class Condition extends _component.Component {
  static on(condition) {
    return Condition.spec({
      condition
    })
  }

  compose(stack) {
    const middleware = stack()
    const { condition: cond, negative } = this.config

    const checkCondition = ctx =>
      typeof cond !== 'function' ? cond : cond(ctx)

    return async (ctx, next) => {
      const result = await checkCondition(ctx)
      if (!result && !negative) return next(ctx)
      if (result && negative) return next(ctx) // return middleware(ctx, () => branching || next())

      return middleware(ctx, next)
    }
  }
} // Condition.plugins = extension().plugin('on', on)
// Condition.on = function (condition) {
//   return Condition.spec({ condition })
// }

exports.Condition = Condition

Condition.on.not = function(condition) {
  return Condition.spec({
    condition,
    negative: true
  })
}

class Branch extends _component.Component {
  compose() {
    const { condition } = this.config
    return Condition.spec({
      condition
    })
      .use(this.config.subcomponents)
      .use(() => {})
  }
} // Branch.plugins = extension(Condition.plugins)

exports.Branch = Branch
var _default = Condition
exports.default = _default
