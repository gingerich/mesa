import Layer from './Layer';

export function createLayer(opts) {
  return new Layer(opts);
}

export default {
  createLayer
};

export { default as Packet } from './packet';

import * as Serialize from './serializers';
export { Serialize };

// export { Transport as BaseTransport } from './transport'
export * from './transports';
