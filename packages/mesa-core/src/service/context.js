import { Component } from '@mesa/component'

export function createContext (defaultValue) {
  const context = {
    currentValue: defaultValue,
    defaultValue
  }

  /*
  * Ex.
  * Provider.spec({ value }))
  *   .use(
  *     Consumer.spec({ subcomponents: value => () => value })
  *   )
  */
  // class Provider extends Component {
  //   compose (middleware) {
  //     const handler = middleware.compose()

  //     return async (msg, next) => {
  //       const oldValue = context.currentValue

  //       context.currentValue = this.config.value

  //       const result = await handler(msg, (res) => {
  //         context.currentValue = oldValue
  //         return next(res)
  //       })

  //       context.currentValue = oldValue

  //       return result
  //     }
  //   }
  // }

  /*
  * Ex.
  * Stack.spec()
  *   .use(Provider.spec({ value }))
  *   .use(Consumer.spec({ subcomponents: value => () => value }))
  */
  class Provider extends Component {
    compose (stack) {
      const middleware = stack()

      return async (msg, next) => {
        const oldValue = context.currentValue

        context.currentValue = this.config.value

        // const result = await next(msg)
        const result = await middleware(msg, next)

        context.currentValue = oldValue

        return result
      }
    }
  }

  class Consumer extends Component {
    compose () {
      return this.config.subcomponents(context.currentValue)
    }
  }

  Consumer._context = context

  return {
    Provider,
    Consumer
  }
}

export default createContext
