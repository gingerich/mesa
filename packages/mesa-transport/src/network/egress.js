import { Service, Middleware, Errors } from '@mesa/core';
import Connector from './connector';
import Interface from './interface';

class Egress extends Interface {
  at(protocol, ...args) {
    super.at(protocol, ...args);
    return this; // ?
  }

  action(action) {
    this._action = action;
    return this;
  }

  resolve(connection) {
    return new Egress.Connector(this, connection);
  }

  connector(resolve, transit) {
    return service => {
      const egressService = Service.create()
        .use(transit.egress())
        .use(this.parent.middleware)
        .use(this.middleware);

      const egressFallback = Middleware.fallback(() => (err, ctx) => {
        if (
          err instanceof Errors.ActionNotFoundError
          // ctx.nodeId === transit.nodeId
        ) {
          return egressService.proxy(ctx);
        }

        throw err;
      });

      // const { protocol } = this.connection;
      // service.ns('transport').action(protocol, ctx => egressService.proxy(ctx));

      service.use(egressFallback);

      return super.connector(resolve, transit)(egressService);
    };
  }
}

Egress.Connector = class EgressConnector extends Connector {
  constructor(egress, connection) {
    super(connection);
    this.egress = egress;
  }

  connector(resolve) {
    return service => {
      const transport = resolve(this.connection);
      return transport.egress(service, this.egress._action);
    };
  }
};

module.exports = Egress;
