import { Component } from '@mesa/component'

export class Stack extends Component {
  compose ({ compose }) {
    const { reverse, subcomponents } = this.config
    const middleware = reverse ? [...subcomponents].reverse() : subcomponents

    return compose(middleware)
  }
}

export default Stack
