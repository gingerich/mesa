import { Component, Spec } from '@mesa/component'
import Accept from './Accept'
import Except from './Except'

const debug = require('debug')('mesa:match')

export class Match extends Component {
  static accept(accept) {
    return Match.spec({ accept })
  }

  static except(except) {
    return Match.spec({ except })
  }

  compose() {
    return Accept.spec({ matches: this.config.accept }).use(
      Except.spec({ matches: this.config.except }).use(
        this.config.subcomponents
      )
    )
  }
}

Match.Spec = class MatchSpec extends Spec {
  constructor(type, config, subcomponents) {
    super(type, config, subcomponents)
    this.config.accept = toArray(this.config.accept)
    this.config.except = toArray(this.config.except)
  }

  accept(accept) {
    this.config.accept = this.config.accept.concat(accept)
    return this
  }

  except(except) {
    this.config.except = this.config.except.concat(except)
    return this
  }
}

const toArray = (val = []) => (Array.isArray(val) ? val : [val])

export default Match
