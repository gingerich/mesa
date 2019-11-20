import Packet from '../packet';
import { Errors } from '@mesa/core';

export class IngressHandler {
  constructor(transit) {
    this.transit = transit;
  }

  handler() {
    return (ctx, next) => {
      this.assertProtocolVersionMatch(ctx.packet);

      if (Packet.isResponse(ctx.packet)) {
        this.handleResponse(ctx.packet);
        return;
      }

      if (Packet.isEvent(ctx.packet)) {
        this.handleEvent(ctx, next);
        return;
      }

      if (Packet.isRequest(ctx.packet)) {
        return this.handleRequest(ctx, next);
      }
    };
  }

  handleRequest(ctx, next) {
    const { payload } = ctx.packet;

    ctx.request = {
      id: payload.rid,
      cid: payload.id,
      meta: payload.meta,
      origin: payload.origin
    };

    const makeResponse = this.getResponsePacketFactory(ctx.request);

    return next(ctx).then(
      data => makeResponse(data),
      error => makeResponse(null, error)
    );
  }

  handleResponse(packet) {
    const { payload } = packet;
    const req = this.transit.pendingRequests.get(payload.id);

    if (!req) {
      throw new Error('Orphan response received');
    }

    this.transit.pendingRequests.delete(payload.id);

    // identify the node that sent the response
    req.ctx.nodeId = payload.origin;

    // Object.assign(req.ctx.meta, payload.meta)

    if (payload.error) {
      req.reject(new Error('error response', payload)); // TODO
      return;
    }

    req.resolve(payload.data);
  }

  handleEvent(ctx, next) {
    ctx.cmd = 'event';
    next(ctx);
  }

  getResponsePacketFactory(request) {
    return (msg, error = null) => {
      const payload = {
        id: request.cid,
        data: msg,
        meta: request.meta,
        origin: this.transit.nodeId,
        v: this.transit.PROTOCOL_VERSION
      };

      if (error !== null) {
        payload.error = error;
      }

      return Packet.create(Packet.PACKET_RESPONSE, payload, request.origin);
    };
  }

  assertProtocolVersionMatch(packet) {
    if (packet.payload.v !== this.transit.PROTOCOL_VERSION) {
      throw new Errors.ProtocolVersionMismatchError({
        nodeId: this.transit.nodeId,
        expected: this.transit.PROTOCOL_VERSION,
        received: packet.payload.v
      });
    }
  }
}
