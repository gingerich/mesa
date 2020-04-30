import Transport from '@mesa/transport';
import { MeshTransport } from './transport';
import Mesh from './mesh';

class ServiceMesh {
  constructor(transporter) {
    this.transporter = transporter;
  }

  createPlugin(opts) {
    return service => {
      service.plugin(this.transporter.createPlugin(opts));
    };
  }
}

export const create = opts => {
  const layer = Transport.createLayer().use('mesh', transport(opts));

  const transporter = layer.transporter(connect => {
    connect.at('mesh');
  });

  return new ServiceMesh(transporter);
};

export const transport = opts => {
  return (connection, transit) => {
    const transport = new MeshTransport(transit, opts);

    const mesh = new Mesh(transit);

    transport.init(mesh);

    return transport;
  };
};
