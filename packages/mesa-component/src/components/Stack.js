import Component from './Component'

export class Stack extends Component {
  compose (middleware) {
    return middleware.compose()
  }
}

export default Stack
