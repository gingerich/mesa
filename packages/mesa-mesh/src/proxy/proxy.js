import { Service } from '@mesa/core';
import MeshIngress from './ingress';
import MeshEgress from './egress';

export default class ServiceProxy {
  constructor(mesh) {
    this.mesh = mesh;

    this.ingress = new MeshIngress(Service.create({ name: 'ingress' }));

    this.egress = new MeshEgress(Service.create({ name: 'egress' }));

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

  removeRemoteService(nodeId) {
    const service = this.registry[nodeId];
    this.egress.broker.removeService(service);
  }

  connect(opts) {
    const dataPlane = opts.dataTransport.transporter(connect => {
      connect.connectors[2].ingress.use(this.ingress.getHandler());
    });

    this.egress.egressService.plugin(dataPlane.createPlugin({ nodeId: this.mesh.meshId }));

    return dataPlane.connect();
  }
}
