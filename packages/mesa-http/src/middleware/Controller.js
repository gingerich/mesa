import Mesa from '@mesa/core'
import { Stack } from '@mesa/common'
import Method from './Method'

const debug = require('debug')('mesa-http:controller')
// const route = require('koa-path-match')()

// @path('/:id')
export class Controller extends Mesa.Component {
  compose() {
    return Method.methods.reduce((stack, method) => {
      const { [method]: handler } = this.config

      if (!handler) {
        return stack
      }

      const wrapper = ctx => handler.call(this, ctx)

      return stack.use(Method.spec({ method }).use(wrapper))
    }, Stack.spec())

    // const controller = this.config.controller || this
    // const path = this.constructor.PATH || this.config.path || '/'
    // const router = route(path)
    // const handledMethods = []
    // methods.forEach((method) => {
    //   const handler = controller[method]
    //   if (handler) {
    //     if (typeof (handler) !== 'function') {
    //       throw new Error(`Expected controller.${method} to be a function`)
    //     }
    //     handledMethods.push(method)
    //     router[method]((ctx) => {
    //       const res = handler.call(controller, ctx)
    //       if (res !== undefined) {
    //         if (ctx.body !== undefined) {
    //           debug('Unexpected return value when ctx.body is already set')
    //         }
    //         ctx.body = res
    //       }
    //     })
    //   }
    // })
    // debug(`[${handledMethods}] ${path}`)
    // return router
  }
}

export default Controller
