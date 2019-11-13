import upring from 'upring'
import Transport from './transport'

export function transport(opts = {}) {
  return (connection, transit) => {
    const instance = upring(connection).use(require('upring-pubsub'))
    const transport = new Transport(transit, opts)
    transport.init(instance, connection)
    return transport
  }
}
