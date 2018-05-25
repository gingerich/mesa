import Component from './Component'

export class Condition extends Component {
  static on (condition) {
    return Condition.spec({ condition })
  }

  compose (middleware) {
    const downstream = middleware.compose()
    const { condition } = this.config

    const conditionFn = (ctx) => {
      if (typeof condition !== 'function') {
        return condition
      }
      return condition(ctx)
    }

    return async (ctx, next) => {
      const result = await conditionFn(ctx)
      if (!result && !this.config.negative) return next()
      else if (result && this.config.negative) return next()

      // return downstream(ctx, () => branching || next())
      return downstream(ctx, next)
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
