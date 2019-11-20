import { Component } from '@mesa/component';
import { matching } from '@mesa/util';
import Condition from './Condition';

export class Except extends Component {
  compose() {
    const { matches = [] } = this.config;
    return Condition.on.not(matching(matches)).use(this.config.subcomponents);
  }
}

export default Except;
