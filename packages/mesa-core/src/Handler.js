import { Component } from '@mesa/component'

export class Handler extends Component {
  compose (stack) {
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

export default Handler
