import { Component as BaseComponent } from '@mesa/component'

export class Component extends BaseComponent {
  /*
  * Send a message
  */
  call (msg) {
    if (!this.context.call) {
      return Promise.resolve()
    }
    return this.context.call(msg)
  }

  /*
  * Defer to previous handler
  */
  defer (msg) {
    if (!this.context.defer) {
      return Promise.resolve(msg)
    }
    return this.context.defer(msg)
  }
}

export default Component
