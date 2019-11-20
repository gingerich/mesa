import { Namespace } from './namespace';
import ServiceFactory from './factory';

const debug = require('debug')('mesa:service');

export function create(schema = {}) {
  const namespace = new Namespace({ match: schema.match });
  return new ServiceFactory(namespace, schema);
}
