import Packet from '../packet'

export class IngressHandler {
  constructor(transit) {
    this.transit = transit
  }

  handler() {
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

  handleRequest(ctx, next) {
    const { payload } = ctx.packet

    ctx.request = {
      id: payload.rid,
      cid: payload.id,
      origin: payload.origin
    }

    const makeResponse = this.getResponsePacketFactory(ctx.request)

    return next(ctx).then(
      data => makeResponse(data),
      error => makeResponse(null, error)
    )
  }

  handleResponse(packet) {
    const { payload } = packet
    const req = this.transit.pendingRequests.get(payload.id)

    if (!req) {
      throw new Error('Orphan response received')
    }

    this.transit.pendingRequests.delete(payload.id)

    // identify the node that sent the response
    req.ctx.nodeId = payload.origin

    // Object.assign(req.ctx.meta, payload.meta)

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

  getResponsePacketFactory(request) {
    return (data, error = null) => {
      const payload = {
        id: request.cid,
        origin: this.transit.nodeId,
        data
      }

      if (error !== null) {
        payload.error = error
      }

      return new Packet(Packet.PACKET_RESPONSE, payload, request.origin)
    }
  }
}
