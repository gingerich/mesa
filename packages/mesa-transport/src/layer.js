import invariant from 'invariant';
import Transporter from './transporter';
import Network from './network';
import Packet from './packet';

export default class Layer {
  constructor() {
    this.transports = {};
    this.plugins = [];
  }

  use(name, transport) {
    invariant(typeof transport === 'function', 'Expected a function');

    this.transports[name] = transport;
    return this;
  }

  // TODO: rename to plugin()
  plugin(...plugins) {
    this.plugins = this.plugins.concat(...plugins);
    return this;
  }

  transporter(init) {
    const connect = new Network.Interface();

    // connect.use((ctx, next) => {
    //   if ('emit' === ctx.cmd) {
    //     ctx.type = Packet.PACKET_EVENT;
    //   } else {
    //     ctx.type = Packet.PACKET_REQUEST;
    //   }

    //   return next(ctx);
    // });

    this.plugins.forEach(plugin => plugin(connect, this));

    init(connect);

    return new Transporter(this, connect);
  }
}
