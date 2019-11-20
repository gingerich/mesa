import net from 'net';
import Mesa from '@mesa/core';
import { once } from 'cluster';

const debug = require('debug')('tcp:client');

export class Client extends Mesa.Component {
  static of(host, port) {
    return Client.spec({ host, port });
  }

  compose() {
    return ctx => {
      const client = net.createConnection(this.config, () => {
        debug('connected');
        client.write(ctx.packet.payload);
      });

      client.on('end', () => debug('disconnected'));

      return new Promise((resolve, reject) => {
        client.on('data', resolve);
        client.on('error', reject);
      });
    };
  }
}

export default Client;
