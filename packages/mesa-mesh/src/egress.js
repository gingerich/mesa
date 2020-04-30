import { ServiceBroker } from '@mesa/core';

export default class MeshEgress {
  constructor(egressService) {
    this.egressService = egressService;
    this.broker = new ServiceBroker();
  }

  getService() {
    return this.broker.service;
  }

  getHandler(nodeId) {
    return ctx => this.egressService.proxy(ctx, { nodeId });
  }
}
