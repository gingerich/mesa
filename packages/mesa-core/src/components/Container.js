import { Component } from '@mesa/component'
import { Stack } from './common'

export class Container extends Component {
  compose() {
    return Stack.spec().use(this.config.subcomponents)
  }
}
