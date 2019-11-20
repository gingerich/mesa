import Server from 'ssb-server';
// import Server from 'secret-stack'
import ssbKeys from 'ssb-keys';
import Config from 'ssb-config/inject';
import Transport from './transport';

const createServer = Server
  // .use(require('ssb-db'))
  .use(require('ssb-gossip'))
  .use(require('ssb-local'))
  .use(require('ssb-logging'))
  .use(require('ssb-replicate'))
  .use(require('ssb-ebt'));

// IDEA: have a "local" strategy using client/server (with ssb-client) setup instead of p2p
// I.e. services all use ssb-client to connec to single ssb-server instance
// this avoids having to configure ssb servers on different ports etc.

export function transport(opts = {}) {
  return ({ ...connection }, transit) => {
    // workaround so multiple servers don't try to own the same db directory
    connection.temp = transit.service.name;

    const config = Config(opts.name, connection);
    const server = createServer(config);

    server.on('rpc:connect', (rpc, isClient) => {
      console.log('RPCCONNECT', rpc.id, isClient);
    });

    const transport = new Transport(transit, opts);
    transport.init(server, config);
    return transport;
  };
}

export const generateKey = ssbKeys.generate;
