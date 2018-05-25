"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Transport = void 0;

var _eventemitter = _interopRequireDefault(require("eventemitter3"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Transport extends _eventemitter.default {
  constructor() {
    super();
    this.protocols = {};
    this.readyPromise = new Promise(resolve => this.once('ready', resolve));
  }

  use(protocol, init) {
    if (typeof init !== 'function') {
      throw new Error('Expected a function');
    }

    this.protocols[protocol] = {
      init
    };
    return this;
  }

  ready(fn) {
    this.readyPromise.then(fn);
    return this;
  }

  protocol(name) {
    return this.protocols[name];
  }

  plugin(bootstrap) {
    return service => {
      const transport = this.init(service);
      service.on('start', (...args) => bootstrap(transport, ...args)); // service.on('start', this.emit.bind(this, 'ready', transport))
    };
  }

  init(service) {
    const transports = Object.keys(this.protocols).reduce((hooks, key) => {
      hooks[key] = {// listen () { throw new Error('Not Implemented') }
        // client () { throw new Error('Not Implemented') }
      };

      function definer(prop) {
        return fn => hooks[key][prop] = fn;
      }

      const protocol = this.protocols[key];
      protocol.init({
        service,
        listen: definer('listen'),
        client: definer('client')
      });
      return hooks;
    }, {});

    function getTransport(name) {
      if (!transports[name]) {
        throw new Error(`No protocol definition for ${name}`);
      }

      return transports[name];
    }

    const listen = (name, ...args) => getTransport(name).listen(...args);

    const client = (name, ...args) => getTransport(name).client(...args);

    return {
      transports,
      listen,
      client
    };
  }

}

exports.Transport = Transport;
var _default = Transport;
exports.default = _default;