import { once } from 'events';
import { BaseTransport } from '@mesa/transport';

export class MeshTransport extends BaseTransport {
  init(mesh) {
    // this.mesh = mesh;
    this.meshClient = mesh.connect();
    this.connected = once(this.meshClient, 'connected');
  }

  async ingress(service) {
    await this.connected;
    this.meshClient.ingress.use(ctx => service.proxy(ctx));
  }

  async egress(service) {
    await this.connected;
    service.use(ctx => this.meshClient.egress.proxy(ctx));
  }
}
