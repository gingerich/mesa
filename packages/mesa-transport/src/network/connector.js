export default class Connector {
  static resolve(value) {
    if (value instanceof Connector) {
      return value
    }

    if (typeof value === 'function') {
      return class extends Connector {
        connector(resolve, transit) {
          return value(resolve, transit)
        }
      }
    }

    throw new Error(`Cannot resolve ${value} to Connector`)
  }

  constructor(connection) {
    this.connection = connection
  }

  connector(/* resolve,  transit */) {
    throw new Error('Not Implemented')
  }
}
