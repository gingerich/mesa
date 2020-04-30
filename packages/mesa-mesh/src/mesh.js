import EventEmitter from 'eventemitter3';
import { Service } from '@mesa/core';
import MeshController from './controller';
import MeshEgress from './egress';
import MeshIngress from './ingress';
import RemoteServiceProxy from './service-proxy';

export default class Mesh {
  constructor(transit) {
    this.transit = transit;

    this.meshId = `mesh::${this.transit.nodeId}`;

    this.controller = new MeshController(this);

    this.ingress = new MeshIngress(Service.create({ name: 'ingress' }));

    this.egress = new MeshEgress(Service.create({ name: 'egress' }));

    this.serviceProxy = new RemoteServiceProxy(this.egress);
  }

  connect(opts = {}) {
    const dataPlane = opts.dataTransport.transporter(connect => {
      connect.connectors[2].ingress.use(this.ingress.getHandler());
    });

    this.egress.egressService.plugin(dataPlane.createPlugin({ nodeId: this.meshId }));

    this.controller.discovery.on('service:up', (nodeId, { ns, actions }) => {
      const serviceDescriptor = new ServiceDescriptor(ns, actions);
      this.serviceProxy.addRemoteService(nodeId, serviceDescriptor);
    });

    this.controller.discovery.on('service:down', nodeId => {
      this.serviceProxy.removeRemoteService(nodeId);
    });

    this.transit.transporter.once('connected', () => {
      this.controller.discovery.publishService(this.transit.service);
    });

    const ingressService = this.ingress.getService();
    const egressService = this.egress.getService();

    const client = new Mesh.Client(ingressService, egressService);

    const connect = async () => {
      await dataPlane.connect(opts);
      await this.controller.connect(opts);
      client.emit('connected');
    };

    connect();

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
