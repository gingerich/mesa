import EventEmitter from 'eventemitter3';
import Packet from './packet';

export default class ServiceDiscovery {
  constructor(controller, mesh) {
    this.controller = controller;
    this.mesh = mesh;
    this.emitter = new EventEmitter();
  }

  publishService(service) {
    const ns = service.name;
    const actions = service.namespace.registry.getPatterns();
    this.controller.service.call({ ns, actions }, null, { cmd: 'up' });
  }

  unpublishService(service) {
    this.controller.service.call(service.name, null, { cmd: 'down' });
  }

  on(event, listener) {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  createTransportPlugin(opts = {}) {
    return connect => {
      connect.egress.use((ctx, next) => {
        if ('up' === ctx.cmd) {
          ctx.packet.type = Packet.PACKET_UP;
        }
        if ('down' === ctx.cmd) {
          ctx.packet.type = Packet.PACKET_DOWN;
        }
        return next(ctx);
      });

      const gossip = connect.at('gossip', opts.gossip);

      gossip.ingress.use((ctx, next) => {
        const { payload } = ctx.packet;
        if (payload.origin === this.mesh.meshId) {
          return;
        }

        if (Packet.isUp(ctx.packet)) {
          this.emitter.emit('service:up', payload.origin, payload.data);
          return;
        }

        if (Packet.isDown(ctx.packet)) {
          this.emitter.emit('service:down', payload.origin);
          return;
        }

        return next(ctx);
      });
    };
  }
}
