import Layer from './Layer'

export function createLayer(opts) {
  return new Layer(opts)
}

export default {
  createLayer
}

import * as Serialize from './serializers'
export { Serialize }

export { Transport as BaseTransport } from './transport'
