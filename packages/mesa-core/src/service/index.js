import invariant from 'invariant'
import { Namespace } from './namespace'
import { Service } from './service'

const debug = require('debug')('mesa:service')

export function create(schema = {}) {
  const Context = {} // TODO?

  if (typeof schema === 'function') {
    schema = schema(Context)
    invariant(schema, 'Schema cannot be undefined')
  } else if (typeof schema === 'string') {
    schema = { name: schema }
  }

  if (!schema.name) {
    debug('Your service schema should define a name')
  }

  // Defaults
  schema = {
    match: {
      nested: true
    },
    config: {},
    ...schema
  }

  const namespace = new Namespace({ match: schema.match })
  const service = new Service(namespace, schema)

  // Catch unhandled errors
  service.use(async (ctx, next) => {
    try {
      return await next(ctx)
    } catch (e) {
      console.error(e)
    }
  })

  let { use = [], actions = [] } = schema

  if (typeof use === 'function') {
    const decorate = use
    use = [() => decorate(service)]
  } else {
    use = use.map(args => () => service.use.apply(service, args))
  }

  if (typeof actions === 'function') {
    const decorate = actions
    actions = [() => decorate(service)]
  } else {
    actions = actions.map(args => () => service.action.apply(service, args))
  }

  const plugins = [...use, ...actions]

  plugins.forEach(plug => plug(service))

  return service
}
