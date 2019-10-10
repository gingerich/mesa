import { Component } from '@mesa/component'
import { fallback } from '../middleware'

export class Actions extends Component {
  compose(stack) {
    const middleware = stack()

    return async (ctx, next) => {
      const originalDefer = ctx.defer
      ctx.defer = next.bind(null, ctx)
      const result = await middleware(ctx) // don't pass next here? if all action middleware run, we don't want to pass control to the next handler :S
      ctx.defer = originalDefer
      return result
    }
  }
}

Actions.Handler = class ActionHandler extends Component {
  compose(stack) {
    const handler = stack()
    const fallbackMiddleware = fallback(this.config.fallback)

    return ctx => fallbackMiddleware(ctx, handler)

    // return ctx => {
    //   return handler(ctx).catch(err => {
    //     const { fallbackHandler } = this.config

    //     if (!fallbackHandler) {
    //       throw err
    //     }

    //     // TODO: logging

    //     if (typeof fallbackHandler !== 'function') {
    //       return Promise.resolve(fallbackHandler)
    //     }

    //     return fallbackHandler(ctx)
    //   })
    // }
  }
}
