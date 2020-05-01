import EventEmitter from 'eventemitter3';
import Packet from './packet';

const SERVICE_UP = 'up';
const SERVICE_DOWN = 'down';

export default class ServiceDiscovery {
  constructor(mesh) {
    this.mesh = mesh;
    this.emitter = new EventEmitter();
  }

  on(event, listener) {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  createTransportPlugin(opts = {}) {
    return connect => {
      connect.egress.use((ctx, next) => {
        if (SERVICE_UP === ctx.type) {
          ctx.packet.type = Packet.PACKET_UP;
        }
        if (SERVICE_DOWN === ctx.type) {
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

ServiceDiscovery.SERVICE_UP = SERVICE_UP;
ServiceDiscovery.SERVICE_DOWN = SERVICE_DOWN;
