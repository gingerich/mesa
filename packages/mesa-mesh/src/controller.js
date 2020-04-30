import { Service } from '@mesa/core';
import Transport, { Serialize } from '@mesa/transport';
import { transport as gossip } from '@mesa/gossip';
import ServiceDiscovery from './discovery';
import Packet from './packet';

export default class MeshController {
  constructor(mesh) {
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
      .plugin(Serialize.JSON());
  }

  getService() {
    return this.service;
  }

  connect(opts = {}) {
    const serviceDiscoveryPlugin = this.discovery.createTransportPlugin(opts.discovery);

    const controlPlane = this.transport.transporter(connect => {
      serviceDiscoveryPlugin(connect);
    });

    const controlPlanePlugin = controlPlane.createPlugin({ nodeId: this.mesh.meshId });

    this.service.plugin(controlPlanePlugin);

    return controlPlane.connect();
  }
}
