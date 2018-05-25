import { Component, compose } from '@mesa/component'
import Stack from './common/Stack'

export class Handler extends Component {
  compose (substream) {
    return compose(substream(), this.context)
  }
}

export default Handler
