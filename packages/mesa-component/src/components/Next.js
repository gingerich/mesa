import Component from './Component'

export class Next extends Component {
  compose () {
    return (ctx, next) => {
      const { skip = false, use = next } = this.config
      return skip || use()
    }
  }
}

export default Next
