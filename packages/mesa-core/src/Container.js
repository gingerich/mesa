import { Component } from '@mesa/component'
import Stack from './common/Stack'

export class Container extends Component {
  compose () {
    return Stack.spec().use(this.config.subcomponents)
  }
}

export default Container
