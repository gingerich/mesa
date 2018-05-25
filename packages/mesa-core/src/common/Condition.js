import { Component } from '@mesa/component'

export class Condition extends Component {
  static on (condition) {
    return Condition.spec({ condition })
  }

  compose (substream) {
    const middleware = substream()
    const { condition: cond, negative } = this.config

    const checkCondition = ctx =>
      typeof cond !== 'function' ? cond : cond(ctx)

    return async (ctx, next) => {
      const result = await checkCondition(ctx)

      if (!result && !negative) return next(ctx)
      if (result && negative) return next(ctx)

      // return middleware(ctx, () => branching || next())
      return middleware(ctx, next)
    }
  }
}

// Condition.plugins = extension().plugin('on', on)

// Condition.on = function (condition) {
//   return Condition.spec({ condition })
// }

Condition.on.not = function (condition) {
  return Condition.spec({ condition, negative: true })
}

export class Branch extends Component {
  compose () {
    const { condition } = this.config
    return Condition.spec({ condition })
      .use(this.config.subcomponents)
      .use(() => {})
  }
}

// Branch.plugins = extension(Condition.plugins)

export default Condition
