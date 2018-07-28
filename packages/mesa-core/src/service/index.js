import invariant from 'invariant'
import { Namespace } from './namespace'
import { Service } from './service'

const debug = require('debug')('mesa:service')

export function create(schema = {}) {
  const Context = {} // TODO?

  if (typeof schema === 'function') {
    schema = schema(Context)
  } else if (typeof schema === 'string') {
    schema = { name: schema }
  }

  invariant(schema, 'Schema cannot be undefined')

  if (!schema.name) {
    debug('Your service schema should define a name')
  }

  const { match = { nested: true } } = schema
  const namespace = new Namespace({ match })

  const options = {
    name: schema.name
  }

  const service = new Service(namespace, options)

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
