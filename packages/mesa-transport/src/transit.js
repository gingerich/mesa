import Packet from './packet'
import { Message } from '@mesa/core/lib/service/message'

export class Transit {
  constructor(transporter, service) {
    this.transporter = transporter
    this.service = service
    this.requestsInFlight = new Map()
  }

  ingress() {
    return (ctx, next) => {
      const { packet = {} } = ctx

      // const { data, type } = ctx.msg
      // const packet = ctx.deserialize(data, type)
      // // const packet = Packet.create(type, payload)
      // ctx.packet = packet

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
      let pendingResult
      // TODO: define constants
      if (Packet.isEvent(ctx.packet)) {
        pendingResult = Promise.resolve(true)
      } else {
        pendingResult = this.makeRequest(ctx)
      }

      // const payload = {
      //   id: ctx.id,
      //   data: ctx.msg,
      //   sender: ctx.nodeID // ?
      // }

      // const data = ctx.serialize(payload)
      // ctx.packet = Packet.create(ctx.cmd, data)

      // const handler = result => {
      //   if (Message.isUnhandled(result)) {
      //     return result
      //   }

      //   if (Packet.isEvent(ctx.packet)) {
      //     return true //Promise.resolve(true)
      //   }

      //   if (Packet.isRequest(ctx.packet)) {
      //     return this.makeRequest(ctx)
      //   }

      //   // TODO: throw or return undefined ?
      //   console.error(
      //     `egress encountered unexpected packet type ${ctx.packet.type}`
      //   )
      // }

      return next(ctx).then(result => {
        if (Message.isUnhandled(result)) {
          return result
        }

        return pendingResult
      })
    }
  }

  makeRequest(ctx) {
    return new Promise((resolve, reject) => {
      const request = {
        ctx,
        resolve,
        reject
      }
      // ctx.request = request
      this.requestsInFlight.set(ctx.id, request)
    })
  }

  handleRequest(ctx, next) {
    const { sender, id } = ctx.packet.payload
    const makeResponse = (msg, error = null) => {
      const payload = {
        id,
        data: msg,
        success: error === null
      }

      if (error) {
        payload.error = error
      }

      const packet = new Packet(Packet.PACKET_RESPONSE, payload, sender)
      // packet.payload = ctx.serialize(packet)
      return payload //packet
    }

    return next(ctx).then(
      data => makeResponse(data),
      error => makeResponse(null, error)
    )
  }

  handleResponse(packet) {
    const { payload } = packet
    const req = this.requestsInFlight.get(payload.id)

    if (!req) {
      throw new Error('Orphan response received')
    }

    this.requestsInFlight.delete(payload.id)

    // merge payload context into request context
    // req.ctx.msg = payload.msg ??
    // etc

    if (!payload.success) {
      req.reject(new Error('error response', payload)) // TODO
      return
    }

    req.resolve(payload.data)
  }

  handleEvent(ctx, next) {
    ctx.cmd = 'event'
    next(ctx) //.catch(err => console.error(err))
  }

  // resolveRequest(ctx) {
  //   const req = this.requestsInFlight.get(ctx.id)
  //   if (!req) return

  //   this.requestsInFlight.delete(ctx.id)

  //   req.
  // }
}
