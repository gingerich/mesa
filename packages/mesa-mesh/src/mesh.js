import EventEmitter from 'eventemitter3';
import { MeshController } from './controller';
import { ServiceProxy } from './proxy';

export default class Mesh {
  constructor(transit) {
    this.transit = transit;

    this.meshId = `mesh::${this.transit.nodeId}`;

    this.controller = new MeshController(this);

    this.proxy = new ServiceProxy(this);
  }

  get ingress() {
    return this.proxy.ingress;
  }

  get egress() {
    return this.proxy.egress;
  }

  connect(opts = {}) {
    this.controller.discovery.on('service:up', (nodeId, { ns, actions }) => {
      const serviceDescriptor = new ServiceDescriptor(ns, actions);
      this.proxy.addRemoteService(nodeId, serviceDescriptor);
    });

    this.controller.discovery.on('service:down', nodeId => {
      this.proxy.removeRemoteService(nodeId);
    });

    this.transit.transporter.once('connected', () => {
      this.controller.publishService(this.transit.service);
    });

    const ingressService = this.proxy.ingress.getService();
    const egressService = this.proxy.egress.getService();

    const client = new Mesh.Client(ingressService, egressService);

    const connectAsync = async () => {
      await this.proxy.connect(opts);
      await this.controller.connect(opts);
      client.emit('connected');
    };

    connectAsync();

    return client;
  }
}

Mesh.Client = class MeshClient extends EventEmitter {
  constructor(ingress, egress) {
    super();
    this.ingress = ingress;
    this.egress = egress;
  }
};

class ServiceDescriptor {
  constructor(ns, actions) {
    this.ns = ns;
    this.actions = actions;
  }
}
