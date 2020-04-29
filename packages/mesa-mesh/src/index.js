import EventEmitter from 'eventemitter3';
import { Service, ServiceBroker } from '@mesa/core';
import Transport, { Serialize } from '@mesa/transport';
import { transport as gossip } from '@mesa/gossip';
import { MeshTransport } from './transport';
import Packet from './packet';

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
    const transport = new MeshTransport(transit, opts);

    const mesh = new Mesh(transit, opts);

    transport.init(mesh);

    return transport;
  };
};

class MeshClient extends EventEmitter {
  constructor(ingress, egress) {
    super();
    this.ingress = ingress;
    this.egress = egress;
  }
}

class Mesh {
  constructor(transit, opts) {
    this.transit = transit;

    this.meshId = `mesh::${this.transit.nodeId}`;

    this.controller = new MeshController(this, opts);

    this.ingress = new MeshIngress(Service.create({ name: 'ingress' }));

    this.dataPlane = opts.dataTransport.transporter(connect => {
      connect.connectors[2].ingress.use(this.ingress.getHandler());
    });

    const egressService = Service.create({ name: 'egress' });
    egressService.plugin(this.dataPlane.createPlugin({ nodeId: this.meshId }));

    this.egress = new MeshEgress(egressService);
  }

  connect(opts) {
    this.controller.discovery.on('service:up', (nodeId, { ns, actions }) => {
      const serviceDescriptor = new ServiceDescriptor(ns, actions);
      this.egress.serviceProxy.addRemoteService(nodeId, serviceDescriptor);
    });

    this.controller.discovery.on('service:down', nodeId => {
      this.egress.serviceProxy.removeRemoteService(nodeId);
    });

    this.transit.transporter.once('connected', () => {
      this.controller.discovery.publishService(this.transit.service);
    });

    const ingressService = this.ingress.getService();
    const egressService = this.egress.getService();

    const client = new MeshClient(ingressService, egressService);

    const connect = async () => {
      await this.dataPlane.connect(opts);
      await this.controller.connect(opts);
      client.emit('connected');
    };

    connect();

    return client;
  }
}

class ServiceDiscovery {
  constructor(controller, mesh) {
    this.controller = controller;
    this.mesh = mesh;
    this.emitter = new EventEmitter();
  }

  publishService(service) {
    const { registry } = service.namespace;
    const actions = Array.from(registry.nodes.values()).map(node => node.pattern);
    const ns = service.name;
    this.controller.service.call({ ns, actions }, null, { cmd: 'up' });
  }

  unpublishService(service) {
    this.controller.service.call(service.name, null, { cmd: 'down' });
  }

  on(event, listener) {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  getTransportPlugin(opts = {}) {
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

class MeshIngress {
  constructor(service) {
    this.service = service;
  }

  getService() {
    return this.service;
  }

  getHandler() {
    return (ctx, next) => {
      console.log('MESH INGRESS', ctx.packet.payload);
      next(ctx);
      return this.service.proxy(ctx);
    };
  }
}

class MeshEgress {
  constructor(egressService) {
    this.egressService = egressService;
    this.broker = new ServiceBroker();
    this.serviceProxy = new RemoteServiceProxy(this);
  }

  getService() {
    return this.broker.service;
  }

  getHandler(nodeId) {
    return ctx => this.egressService.proxy(ctx, { nodeId });
  }
}

class MeshController {
  constructor(mesh, opts = {}) {
    this.mesh = mesh;
    this.discovery = new ServiceDiscovery(this, this.mesh);
    this.service = Service.create({ name: 'control' });
    this.transport = Transport.createLayer()
      .use(
        'gossip',
        gossip({
          topicTypes: [Packet.PACKET_UP, Packet.PACKET_DOWN],
          topics: () => [{ type: Packet.PACKET_UP }, { type: Packet.PACKET_DOWN }]
        })
      )
      .plugin(Serialize.JSON())
      .plugin(this.discovery.getTransportPlugin(opts.discovery));
  }

  connect() {
    const controlPlane = this.transport.transporter();

    const controlPlanePlugin = controlPlane.createPlugin({ nodeId: this.mesh.meshId });

    this.service.plugin(controlPlanePlugin);

    return controlPlane.connect();
  }
}

class RemoteServiceProxy {
  constructor(egress) {
    this.egress = egress;
    this.registry = {};
  }

  addRemoteService(nodeId, { actions, ns }) {
    const broker = this.egress.broker;

    if (broker.namespace.registry.has(ns) || broker.namespace.registry.has({ ns })) {
      console.log(`Received service discovery for known service ${ns}`);
      return;
    }

    console.log('SERVICE DISCOVERED', nodeId, actions, ns);

    const remoteService = broker.createService({ name: ns });

    this.registry[nodeId] = remoteService;

    const remoteActionHandler = this.egress.getHandler(nodeId);

    actions.forEach(action => {
      remoteService.action(action, remoteActionHandler);
    });
  }

  removeRemoteService(ns) {
    this.egress.broker.namespace.unregister(ns);
  }

  // TODO: remove by nodeId instead?
  _removeRemoteService(nodeId) {
    const service = this.registry[nodeId];
    this.egress.broker.removeService(service);
    // how do we handle broker.service.call caching the composed handler?
    // actually namespace should handle it fine except the memoized matching
  }
}

class ServiceDescriptor {
  constructor(ns, actions) {
    this.ns = ns;
    this.actions = actions;
  }
}
