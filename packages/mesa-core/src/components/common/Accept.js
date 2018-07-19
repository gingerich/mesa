import { Component } from '@mesa/component'
import { matching } from '@mesa/util'
import Condition from './Condition'

export class Accept extends Component {
  compose() {
    const { matches = [] } = this.config
    return Condition.on(matching(matches)).use(this.config.subcomponents)
  }
}

export default Accept
