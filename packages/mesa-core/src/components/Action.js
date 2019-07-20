import { Component } from '@mesa/component'

export class Action extends Component {
  compose(stack) {
    const middleware = stack()

    return async (ctx, next) => {
      const originalDefer = ctx.defer
      ctx.defer = next.bind(ctx)
      const result = await middleware(ctx) // don't pass next here? if all action middleware run, we don't want to pass control to the next handler :S
      ctx.defer = originalDefer
      return result
    }
  }
}
