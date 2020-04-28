import { Service } from '@mesa/core';
import { Transport } from '@mesa/transport';
import { transport as gossip } from '@mesa/gossip';
import { MeshTransport } from './transport';
import Packet from './packet';

export const plugin = (opts = {}) => {
  return service => {
    const meshService = Service.create({ name: `${service.name}.mesh` });
    const controlService = Service.create();
    // const dataService = Service.create();
    const controlPlane = control(service, meshService);

    controlService.plugin(controlPlane.plugin());

    // const meshTransporter = Transport.createLayer()
    //   .protocol('mesh', transport({ meshService }))
    //   .transporter(connect => {
    //     connect.at('mesh');
    //   });

    controlPlane.on('connected', transit => {
      const ns = service.name;
      const actions = service.namespace.registry.nodes.values().map(node => {
        return node.pattern;
      });
      console.log('UP', ns, actions);
      controlService.emit({ ns, actions, nodeId: transit.nodeId }, null, { cmd: 'up' });
    });

    controlPlane.on('disconnected', () => {
      const ns = service.name;
      controlService.emit({ ns }, null, { cmd: 'down' });
    });

    // service.plugin(meshTransporter.plugin());

    meshService.plugin(dataPlane.plugin());
  };
};

export const transport = opts => {
  return (connection, transit) => {
    const meshTransport = new MeshTransport(transit, opts);
    // meshTransport.init();
    return meshTransport;
  };
};

use('mesh', mesh());

connect
  .at('mesh.control', { gossip })
  .at('kafka')
  .use(json());
connect.at('mesh.data');

// service

// data plane
// - just has data plane transport
// - every call() attempts remote call

// proxy service
// - dynamically added actions that proxy the msg by calling the dataPlane with the appropriate nodeId
// - ingress proxies requests to service

// control plane
// - gossip transport
// - capture actions of service and publish
// - on receive actions add to proxy service (must be idempotent operation)
// - on received service down remove namespace from proxy service

const service = broker.createService('test');
service.plugin(mesh());
service.plugin(
  Transport.createLayer()
    .protocol('kafka', kafka())
    .transporter(connect => {
      connect.at('kafka');
    })
    .plugin()
);

const control = (service, mesh) => {
  return Transport.createLayer()
    .protocol(
      'gossip',
      gossip({
        topicTypes: [Packet.PACKET_UP, Packet.PACKET_UP]
      })
    )
    .use(connect => {
      connect.egress.use((ctx, next) => {
        if ('up' === ctx.cmd) {
          ctx.packet.type = Packet.PACKET_UP;
        }
        if ('down' === ctx.cmd) {
          ctx.packet.type = Packet.PACKET_DOWN;
        }
        return next(ctx);
      });
    })
    .transporter(connect => {
      connect.at('gossip', opts.gossip).ingress.use((ctx, next) => {
        if (Packet.isUp(ctx.packet)) {
          const { actions, ns } = ctx.packet.data;
          const targetNodeId = ctx.packet.origin;
          const namespace = mesh.ns(ns);

          actions.forEach(action => {
            namespace.register(action, ctx => {
              ctx.nodeId = targetNodeId;
              return service.proxy(ctx);
              // return ctx.call('transport.egress', ctx.msg, { ctx });
              // return service.call(ctx.msg, null, { nodeId });
            });
          });
          return;
        }

        if (Packet.isDown(ctx.packet)) {
          const { ns } = ctx.packet.data;
          mesh.namespace.unregister(ns);
          return;
        }

        return next(ctx);
      });
    });
};
