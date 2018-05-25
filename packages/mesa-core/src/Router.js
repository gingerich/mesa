import Component from './Component'
import Stack from './common/Stack'

export class Router extends Component {

  static destructure (key) {
    return Router.spec({ destructure: key })
  }

  compose ({ compose }) {
    return (msg, next) => {
      // Lookup handlers for msg
      const match = this.config.match(msg)

      // No handlers to accept msg
      if (!match) {
        return next(msg)
      }

      const { destructure, balanceComponent = Stack.spec() } = this.config

      // Optionally destructure msg
      const { [destructure]: payload } = msg
      if (payload) {
        msg = payload
      }

      const balancer = balanceComponent.use(match.node.handlers)
      const handler = compose([balancer])

      // Don't pass next at the namespace level
      return handler(msg)

      // const handler = compose(match.node.handlers)
      // return handler(msg)
    }
  }
}

export default Router
