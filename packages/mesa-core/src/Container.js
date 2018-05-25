import { Component } from '@mesa/component'
import Stack from './common/Stack'

export class Container extends Component {

  get mesa () {
    return this.config.mesa
  }

  setNext (next) {
    this.next = next
  }

  // getChildContext () {
  //   return this
  // }

  call (msg) {
    return this.mesa.call(msg)
  }

  defer (msg) {
    if (!this.next) {
      return Promise.resolve(msg)
    }
    return this.next(msg)
  }

  compose ({ compose }) {
    // return compose([
    //   ...this.config.subcomponents,

    //   // Unhandled messages will return null
    //   ctx => null
    // ])

    return Stack.spec()
      .use(this.config.subcomponents)

      // Unhandled messages should return null
      // .use(ctx => null)
  }
}

export default Container
