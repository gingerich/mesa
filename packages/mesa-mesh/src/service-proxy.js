export default class RemoteServiceProxy {
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
