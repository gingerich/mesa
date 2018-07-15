import { Component } from '@mesa/component'

export class Stack extends Component {
  compose (stack) {
    const { reverse, subcomponents } = this.config
    const middleware = reverse ? [...subcomponents].reverse() : subcomponents

    return stack.compose(middleware)
  }
}
