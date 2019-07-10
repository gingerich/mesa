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
          const response = await this.service.call({ data })
          sock.write(response)
        })

        sock.on('end', () => debug('connection ended'))
        sock.on('close', () => debug('socket closed'))
        sock.on('error', err => debug('error'))
      })
      .listen(...args)
  }
}
