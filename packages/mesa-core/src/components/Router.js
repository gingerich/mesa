import { Component } from '@mesa/component'
import { Stack } from './common'

export class Router extends Component {
  static destructure(key) {
    return Router.spec({ destructure: key })
  }

  compose(stack) {
    return (ctx, next) => {
      // Lookup handlers for msg
      const match = this.config.match(ctx.msg)

      // No handlers for msg
      if (!match) {
        return next(ctx)
      }

      const {
        destructure = 'body',
        balanceComponent = Stack.spec()
      } = this.config

      // Optionally destructure msg
      const { [destructure]: body } = ctx.msg
      if (body) {
        ctx.msg = body
      }

      const balancer = balanceComponent.use(match.node.handlers)
      const handler = stack.compose([balancer])

      return handler(ctx, ({ msg }) => msg)
    }
  }
}
