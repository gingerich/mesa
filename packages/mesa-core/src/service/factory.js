import invariant from 'invariant';
import { Service } from './service';
import { fallback } from '../middleware';

const debug = require('debug')('mesa:service-factory');

export default function ServiceFactory(namespace, schema = {}) {
  const Context = {}; // TODO?

  if (typeof schema === 'function') {
    schema = schema(Context);
    invariant(schema, 'Schema cannot be undefined');
  } else if (typeof schema === 'string') {
    schema = { name: schema };
  }

  if (!schema.name) {
    debug('Your service schema should define a name');
  }

  // Defaults
  schema = {
    match: {
      nested: true
    },
    config: {},
    ...schema
  };

  const service = new Service(namespace, schema);

  service.use(fallback(ctx => ctx.options.fallback));

  let { use = [], actions = [] } = schema;

  if (typeof use === 'function') {
    const decorate = use;
    use = [() => decorate(service)];
  } else {
    use = use.map(args => () => service.use.apply(service, args));
  }

  if (typeof actions === 'function') {
    const decorate = actions;
    actions = [() => decorate(service)];
  } else {
    actions = actions.map(args => () => service.action.apply(service, args));
  }

  const plugins = [...use, ...actions];

  plugins.forEach(plug => plug(service));

  return service;
}
