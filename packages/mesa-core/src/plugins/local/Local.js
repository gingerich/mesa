import { Component, compose } from '@mesa/component'

/*
* Matches incoming message against locally registered patterns
* Calls next() if none match
*/
export class Local extends Component {
  compose () {
    const { lookup } = this.config

    return (msg, next) => {
      const handler = lookup(msg)
      if (handler) {
        return compose(handler, this.context)(msg, next)
      }
      return next(msg)
    }
  }
}

export default Local
