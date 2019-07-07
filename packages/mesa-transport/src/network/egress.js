import Mesa from '@mesa/core'
import Connector from './connector'
import Interface from './interface'

module.exports = class Egress extends Interface {
  connector(resolve, transit) {
    return service => {
      const s = Mesa.createService('321')
        .use(this.parent.middleware)
        .use(this.middleware)
        .use(transit.egress())

      // service.use(s)

      // const transport = resolve(this.connection)

      // if (!this.actions.length) {
      //   return transport.egress(s)
      // }

      // const connections = this.actions.map(action =>
      //   transport.egress(s, this.connection, action)
      // )

      return super.connector(resolve, transit)(s)
    }
  }
}
