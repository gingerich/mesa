import Component from './Component'
import Condition from './Condition'
import matching from '../matching'

export class Except extends Component {
  compose () {
    const { matches = [] } = this.config
    return Condition.on.not(matching(matches)).use(this.config.subcomponents)
  }
}

export default Except
