import { Component } from '@mesa/component'

export class Next extends Component {
  compose () {
    return (ctx, next) => {
      const { skip = false, use = next } = this.config
      return skip || use(ctx)
    }
  }
}

export default Next
