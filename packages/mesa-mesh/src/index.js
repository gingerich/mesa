import { Service } from '@mesa/core';
import Transport, { Serialize } from '@mesa/transport';
import { transport as gossip } from '@mesa/gossip';
import { MeshTransport } from './transport';
import Packet from './packet';

const controlTransport = Transport.createLayer()
  .use(
    'gossip',
    gossip({
      topicTypes: [Packet.PACKET_UP, Packet.PACKET_DOWN],
      topics: () => [{ type: Packet.PACKET_UP }, { type: Packet.PACKET_DOWN }]
    })
  )
  .plugin(Serialize.JSON())
  .plugin(connect => {
    connect.egress.use((ctx, next) => {
      if ('up' === ctx.cmd) {
        ctx.packet.type = Packet.PACKET_UP;
      }
      if ('down' === ctx.cmd) {
        ctx.packet.type = Packet.PACKET_DOWN;
      }
      return next(ctx);
    });
  });

export const create = (opts = {}) => {
  const transporter = Transport.createLayer()
    .use('mesh', transport(opts))
    .transporter(connect => {
      connect.at('mesh', opts.gossip);
    });

  const createPlugin = options => service => {
    service.plugin(transporter.createPlugin(options));
  };

  return { transporter, createPlugin };
};

export const transport = opts => {
  return ({ ...connection }, transit) => {
    const nodeId = `mesh:control//${transit.nodeId}`;

    const egressService = Service.create({ name: 'egress' });
    const ingressService = Service.create({ name: 'ingress' });
    const registryService = Service.create({ name: 'registry' });

    const dataPlane = opts.dataTransport.transporter(connect => {
      connect.connectors[2].ingress.use((ctx, next) => {
        console.log('MESH INGRESS', ctx.packet.payload);
        // if (Packet.isResponse(ctx.packet)) {
        //   return next(ctx);
        // }
        next(ctx);
        return ingressService.proxy(ctx);
      });
    });

    egressService.plugin(dataPlane.createPlugin({ nodeId }));

    const proxyMiddleware = ctx => egressService.proxy(ctx);

    const onServiceDiscovered = (nodeId, { actions, ns }) => {
      const { registry } = registryService.namespace;
      if (registry.has(ns) || registry.has({ ns })) {
        console.log(`Received service discovery for known service ${ns}`);
        return;
      }

      console.log('SERVICE DISCOVERED', nodeId, actions, ns);
      const namespace = registryService.namespace.ns(ns);
      actions.forEach(action => {
        namespace.register(action, ctx => {
          ctx.nodeId = nodeId;
          console.log('MESH EGRESS', ctx.msg);
          return proxyMiddleware(ctx);
        });
      });
    };

    const onServiceOffline = ns => {
      registryService.namespace.unregister(ns);
    };

    const controlPlane = controlTransport.transporter(connect => {
      const iface = connect.at('gossip', opts.gossip);
      iface.ingress.use((ctx, next) => {
        const { payload } = ctx.packet;
        if (payload.origin === nodeId) {
          return;
        }

        if (Packet.isUp(ctx.packet)) {
          onServiceDiscovered(payload.origin, payload.data);
          return;
        }

        if (Packet.isDown(ctx.packet)) {
          onServiceOffline(payload.data.ns);
          return;
        }

        return next(ctx);
      });
      // iface.egress.use((ctx, next) => {
      //   console.log('sdgadgfdg', ctx);
      //   return next(ctx);
      // });
    });

    const controlService = Service.create({ name: 'control' });
    controlService.plugin(controlPlane.createPlugin({ nodeId }));

    const mesh = {
      ingress: ingressService,
      egress: registryService, // egressService,
      control: controlService
    };

    const connected = dataPlane.connect().then(() => controlPlane.connect());

    const transport = new MeshTransport(transit, opts);

    transport.init(mesh, connected);

    return transport;
  };
};
