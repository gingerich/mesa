import net from 'net'
import Mesa from '@mesa/core'

const debug = require('debug')('tcp:server')

export class Server {
  constructor(options = {}) {
    this.options = options

    const upstream = []

    if (options.msgFromRequest) {
      const transform = ({ msg }, next) => next(options.msgFromRequest(msg))
      upstream.push(Mesa.use(transform))
    }

    this.service = Mesa.createService({ name: 'server', upstream })
  }

  plugin(plug) {
    plug(this.service)
    return this
  }

  listen(...args) {
    return net
      .createServer(sock => {
        sock.on('data', async data => {
          // parse data into type,payload
          const packet = await this.service.call({ data, type: 'REQUEST' })
          sock.write(packet.payload)
        })

        sock.on('end', () => debug('connection ended'))
        sock.on('close', () => debug('socket closed'))
        sock.on('error', err => debug('error'))
      })
      .listen(...args)
  }
}
