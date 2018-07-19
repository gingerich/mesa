import namespace from './namespace'
import { Service } from './service'

export function createService(options = {}) {
  const ns = namespace({ match: { nested: true } })
  const service = new Service(ns)

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
    () => service.use(ns.router()),

    ...actions
  ]

  plugins.forEach(plug => plug(service))

  return service
}
