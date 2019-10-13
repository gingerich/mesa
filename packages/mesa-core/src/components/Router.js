import memoize from 'fast-memoize'
import { Component } from '@mesa/component'
import { Stack } from './common'
import { Actions } from './Actions'

export class Router extends Component {
  static destructure(key) {
    return Router.spec({ destructure: key })
  }

  compose(stack) {
    const {
      destructure = 'body',
      Balancer = Stack // TODO balancing
    } = this.config

    const makeHandler = memoize(nodes => {
      // const balancer = Stack.spec().use(handlers) // TODO balancing
      // return stack.compose([balancer])
      const components = nodes.map(node =>
        Actions.spec().use(Balancer.spec().use(node.handlers))
      )
      return stack.compose(components)
    })

    return (ctx, next) => {
      // Lookup handlers for msg
      const match = this.config.match(ctx.msg)

      // No handlers for msg
      if (match === null) {
        return next(ctx)
      }

      // Optionally destructure msg
      const { [destructure]: body } = ctx.msg
      if (body) {
        ctx.msg = body
      }

      const handler = makeHandler(match.nodes)

      return handler(ctx) //, ({ msg }) => msg)
    }
  }
}
