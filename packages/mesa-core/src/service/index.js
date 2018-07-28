import { Namespace } from './namespace'
import { Service } from './service'

const debug = require('debug')('createService')

export function create(schema = {}) {
  const namespace = new Namespace({ match: { nested: true } })

  if (typeof schema === 'string') {
    schema = { name: schema }
  }

  if (!schema.name) {
    debug('Creating an unnamed service is not recommended')
  }

  const options = {
    name: schema.name
  }

  const service = new Service(namespace, options)

  const Context = {} // TODO?

  if (typeof schema === 'function') {
    schema = schema(Context)
  } else if (typeof schema === 'string') {
    schema = { name: schema }
  }

  // Catch unhandled errors
  service.use(async (msg, next) => {
    try {
      return await next(msg)
    } catch (e) {
      console.error(e)
    }
  })

  let { use = [], actions = [] } = schema

  if (typeof use === 'function') {
    const decorate = use
    use = [() => decorate(service)]
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
