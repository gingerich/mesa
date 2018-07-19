import net from 'net'
import Mesa from '@mesa/core'

const debug = require('debug')('tcp:client')

export class Client extends Mesa.Component {
  static of(host, port) {
    return Client.spec({ host, port })
  }

  compose(compose) {
    const middleware = compose(this.config.subcomponents)

    return ({ msg }) => {
      const client = net.createConnection(this.config, () => {
        debug('connected')
        client.write(JSON.stringify(msg))
      })

      client.on('end', () => debug('disconnected'))

      return new Promise((resolve, reject) => {
        client.on('data', async data => {
          // const result = await middleware(data.toString())
          try {
            const json = JSON.parse(data.toString())
            resolve(json)
          } catch (err) {
            reject(err)
          }
        })

        client.on('error', reject)
      })
    }
  }
}

export default Client
