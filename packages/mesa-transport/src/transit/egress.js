import Packet from '../packet'

export class EgressHandler {
  constructor(transit) {
    this.transit = transit
  }

  handler() {
    return (ctx, next) => {
      ctx.packet = this.packetFromContext(ctx)

      let pendingResult = true
      if (Packet.isRequest(ctx.packet)) {
        pendingResult = this.makeRequest(ctx)
      }

      return next(ctx).then(
        () => pendingResult,
        error => {
          this.abortRequest(ctx)
          throw error
        }
      )
    }
  }

  packetFromContext(ctx) {
    const type =
      ctx.cmd === 'event' ? Packet.PACKET_EVENT : Packet.PACKET_REQUEST

    return Packet.create(type, {
      id: ctx.id,
      rid: 'todo', //uuid(),
      pid: ctx.request && ctx.request.id,
      data: ctx.msg,
      origin: this.transit.nodeId
    })
  }

  makeRequest(ctx) {
    return new Promise((resolve, reject) => {
      const request = {
        ctx,
        resolve,
        reject
      }
      this.transit.pendingRequests.set(ctx.id, request)
    })
  }

  abortRequest(ctx) {
    this.transit.pendingRequests.delete(ctx.id)
  }
}