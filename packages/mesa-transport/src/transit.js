import Packet from './packet'
import { Message } from '@mesa/core/lib/service/message'

export class Transit {
  constructor(transporter, service) {
    this.transporter = transporter
    this.service = service
    this.pendingRequests = new Map()
  }

  ingress() {
    return (ctx, next) => {
      const { packet = {} } = ctx

      if (Packet.isResponse(packet)) {
        this.handleResponse(packet)
        return
      }

      if (Packet.isEvent(packet)) {
        this.handleEvent(ctx, next)
        return
      }

      if (Packet.isRequest(packet)) {
        return this.handleRequest(ctx, next)
      }
    }
  }

  egress() {
    return (ctx, next) => {
      const payload = {
        id: ctx.id,
        data: ctx.msg
        // origin: this.nodeID
      }
      const type =
        ctx.cmd === 'event' ? Packet.PACKET_EVENT : Packet.PACKET_REQUEST

      ctx.packet = Packet.create(type, payload)

      let pendingResult = true
      if (Packet.isRequest(ctx.packet)) {
        pendingResult = this.makeRequest(ctx)
      }

      return next(ctx).then(
        result => {
          if (Message.isUnhandled(result)) {
            return result
          }

          return pendingResult
        },
        error => {
          this.abortRequest(ctx)
          throw error
        }
      )
    }
  }

  makeRequest(ctx) {
    return new Promise((resolve, reject) => {
      const request = {
        ctx,
        resolve,
        reject
      }
      this.pendingRequests.set(ctx.id, request)
    })
  }

  abortRequest(ctx) {
    this.pendingRequests.delete(ctx.id)
  }

  handleRequest(ctx, next) {
    const { origin, id } = ctx.packet.payload
    const makeResponse = (msg, error = null) => {
      const payload = {
        id,
        data: msg
      }

      if (error) {
        payload.error = error
      }

      return new Packet(Packet.PACKET_RESPONSE, payload, origin)
    }

    return next(ctx).then(
      data => makeResponse(data),
      error => makeResponse(null, error)
    )
  }

  handleResponse(packet) {
    const { payload } = packet
    const req = this.pendingRequests.get(payload.id)

    if (!req) {
      throw new Error('Orphan response received')
    }

    this.pendingRequests.delete(payload.id)

    // merge payload context into request context
    // req.ctx.msg = payload.msg ??
    // etc

    if (payload.error) {
      req.reject(new Error('error response', payload)) // TODO
      return
    }

    req.resolve(payload.data)
  }

  handleEvent(ctx, next) {
    ctx.cmd = 'event'
    next(ctx)
  }
}
