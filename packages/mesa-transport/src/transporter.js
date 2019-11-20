import memoize from 'mem';
import invariant from 'invariant';
import { once, EventEmitter } from 'events';
import { Transit } from './transit';

export default class Transporter extends EventEmitter {
  static getResolver(layer, transit) {
    return connection => {
      const transport = layer.transports[connection.scheme];

      invariant(transport, `No protocol definition for ${connection.scheme}`);

      // only enforce immutability in dev?
      // required for effective memoization
      Object.freeze(connection);

      return transport(connection, transit);
    };
  }

  constructor(layer, iface) {
    super();
    this.layer = layer;
    this.interface = iface;
  }

  plugin(opts) {
    return service => {
      // memoize resolver to use same transport instance per unique connection
      const transit = new Transit(this, service, opts);
      const resolve = memoize(Transporter.getResolver(this.layer, transit));
      const connect = this.interface.connector(resolve, transit);

      this.once('connect', options => {
        const connected = connect(service, options);

        Promise.resolve(connected).then(
          connections => this.emit('connected', connections),
          error => this.emit('error', error)
        );
      });
    };
  }

  add(iface) {
    this.interface.add(iface);
    return this;
  }

  connect(options) {
    const connected = once(this, 'connected');
    this.emit('connect', options);
    return connected;
  }
}
