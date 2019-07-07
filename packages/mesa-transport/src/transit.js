import Packet from './packet'

export class Transit {
  constructor(transporter) {
    this.transporter = transporter
    this.activeRequests = new Map()
  }

  ingress() {
    return (ctx, next) => {
      const { packet = {} } = ctx

      if (Packet.isResponse(packet)) {
        this.handleResponse(packet)
        return
      }

      if (Packet.isEvent(packet)) {
        return this.handleEvent(ctx, next)
      }

      return next(ctx)
    }
  }

  egress() {
    return (ctx, next) => {
      const p = this.makeRequest(ctx)
      return next(ctx).then(p)
    }
  }

  makeRequest(ctx) {
    return new Promise((resolve, reject) => {
      const request = {
        ctx,
        resolve,
        reject
      }
      this.activeRequests.set(ctx.id, request)
    })
  }

  handleResponse(packet) {
    const req = this.activeRequests.get(packet.id)

    if (!req) {
      throw new Error('Orphan response received')
    }

    this.activeRequests.delete(packet.id)

    // merge packet context into request context
    req.ctx.msg = packet.data
    // etc

    if (!packet.success) {
      req.reject(new Error('error response', packet)) // TODO
      return
    }

    req.resolve(req.ctx)
  }

  handleEvent(ctx, next) {
    // TODO?
    return next(ctx)
  }
}
