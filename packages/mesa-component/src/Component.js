import invariant from 'invariant'
import get from 'lodash.get'
import { extension } from '@mesa/util'
import Spec from './Spec'

const debug = require('debug')('mesa:component')

export class Component {
  static spec(config, factory = this) {
    const Specification = this.Spec || class extends Spec {}

    // Apply plugins
    extension(this.plugins).extend(Specification)

    return new Specification(factory, config)
  }

  static of(source) {
    if (source instanceof this) {
      return source
    } else if (typeof source === 'function') {
      return class extends this {
        compose() {
          return source(this.config, this.context)
        }
      }
    } else {
      throw new Error(`Cannot componentize unexpected type ${typeof source}`)
    }
  }

  static functional(fn) {
    return class extends this {
      compose() {
        return fn(this.config, this.context)
      }
    }
  }

  constructor(config, context) {
    this.config = Object.assign(get.bind(null, config), config)
    this.context = context
  }

  componentWillMount() {
    // Component lifecycle method
  }

  componentDidMount() {
    // Component lifecycle method
  }

  /*
   * Return middleware function (See http://koajs.com)
   */
  compose() {
    throw new Error(`${this.constructor.name} must implement compose()`)
  }

  toJSON() {
    return JSON.stringify(this.constructor.name)
  }
}

export default Component
