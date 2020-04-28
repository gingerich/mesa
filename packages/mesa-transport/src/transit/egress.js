import { uuid } from '@mesa/util';
import Packet from '../packet';

export class EgressHandler {
  constructor(transit) {
    this.transit = transit;
  }

  handler() {
    return (ctx, next) => {
      ctx.packet = this.packetFromContext(ctx);

      let pendingResult = true;
      if (Packet.isRequest(ctx.packet)) {
        pendingResult = this.makeRequest(ctx);
      }

      return next(ctx).then(
        () => pendingResult,
        error => {
          this.abortRequest(ctx);
          throw error;
        }
      );
    };
  }

  packetFromContext(ctx) {
    const type = getPacketType(ctx.cmd);
    const target = ctx.nodeId;
    const payload = {
      id: ctx.id,
      rid: uuid(),
      pid: ctx.request && ctx.request.id,
      origin: this.transit.nodeId,
      data: ctx.msg,
      meta: ctx.meta,
      v: this.transit.PROTOCOL_VERSION
    };

    return Packet.create(type, payload, target);
  }

  makeRequest(ctx) {
    return new Promise((resolve, reject) => {
      const request = {
        ctx,
        resolve,
        reject
      };
      this.transit.pendingRequests.set(ctx.id, request);
    });
  }

  abortRequest(ctx) {
    this.transit.pendingRequests.delete(ctx.id);
  }
}

function getPacketType(cmd) {
  // return ctx.type;
  if ('emit' === cmd) {
    return Packet.PACKET_EVENT;
  }
  return Packet.PACKET_REQUEST;
}
