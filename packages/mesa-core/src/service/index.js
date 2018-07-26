import namespace from './namespace'
import { Service } from './service'

export function create(options = {}) {
  const ns = namespace({ match: { nested: true } })

  if (typeof options === 'string') {
    options = { name: options }
  }

  const serviceOptions = {
    name: options.name
  }

  const service = new Service(ns, serviceOptions)

  const Context = {} // TODO?

  if (typeof options === 'function') {
    options = options(Context)
  } else if (typeof options === 'string') {
    options = { name: options }
  }

  // Catch unhandled errors
  service.use(async (msg, next) => {
    try {
      return await next(msg)
    } catch (e) {
      console.error(e)
    }
  })

  const { upstream = [], actions = [] } = options

  if (typeof upstream === 'function') {
    const decorate = upstream
    upstream = [() => decorate(service)]
  }

  if (typeof actions === 'function') {
    const decorate = actions
    actions = [() => decorate(service)]
  }

  const plugins = [
    ...upstream,

    // Use default namespace
    // () => service.use(ns.router()),

    ...actions
  ]

  plugins.forEach(plug => plug(service))

  return service
}
