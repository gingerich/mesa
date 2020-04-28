import { BaseTransport } from '@mesa/transport';
import { getConsoleOutput } from '@jest/console';

// export class MeshTransport extends BaseTransport {
//   init(meshService) {
//     this.mesh = meshService;
//   }

//   ingress(ingressService) {
//     const ns = this.transit.service.name;
//     const actions = this.transit.service.namespace.registry.nodes.values().map(node => {
//       return node.pattern;
//     });
//     this.mesh.on('message', msg => {
//       ingressService.call(msg);
//     });

//   }

//   egress(egressService) {
//     egressService.use(ctx => {
//       return this.mesh.call(ctx.msg, null, { ctx });
//     });
//   }
// }

export class MeshTransport extends BaseTransport {
  init(mesh, connected) {
    this.mesh = mesh;
    this.connected = connected;

    this.transit.transporter.once('connected', () => {
      const actions = [...this.transit.service.namespace.registry.nodes.values()].map(
        node => node.pattern
      );
      const ns = this.transit.service.name;
      console.log('MESH CONNECTED');
      schedule({ actions, ns }, data => {
        this.mesh.control.call(data, null, { cmd: 'up' });
      });
    });
  }

  ingress(service) {
    this.mesh.ingress.use(ctx => service.proxy(ctx));
  }

  egress(service) {
    return this.connected.then(() => {
      service.use(ctx => this.mesh.egress.proxy(ctx));
    });
  }
}

function schedule(data, callback) {
  const intervalId = setInterval(callback, 1000, data);
  return () => clearInterval(intervalId);
}
