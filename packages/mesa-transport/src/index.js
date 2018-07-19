import Transport from './transport'

export function createLayer(opts) {
  return new Transport(opts)
}

export default module.exports
