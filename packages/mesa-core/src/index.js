import Service from './Service'
import namespace from './namespace'
import Transport from './transport'
import { createContext } from './context'

function makeContext(service) {
  return {
    call (msg) {
      return service.call(msg)
    },
    service
  }
}

function createService (options = {}) {
  const ns = namespace({ nested: true })
  const service = new Service(ns)

  const ctx = makeContext(service)
  const context = createContext(ctx)

  service.Context = context.Consumer

  if (typeof options === 'function') {
    options = options(context)
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

  // Expose context downstream
  const { isolate = true } = options
  if (isolate) {
    service.use(context.Provider.spec({ value: ctx }))
  }

  // Use default namespace
  // service.use(service.namespace)
  // service.use(ns.router())

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

export function transport (options) {
  return new Transport(options)
}

export function use (component) {
  return service => service.use(component)
}

export function action (pattern, handler) {
  return service => service.action(pattern, handler)
}

export function ns (namespace, ...actions) {
  if (Array.isArray(actions[0])) {
    actions = actions[0]
  }

  return service => actions.reduce((s, actn) => actn(s), service.ns(namespace))
}

export { createService, createContext }

// export * from './Component'
export * from './Namespace'
export * from './common/Match'
export * from './common/Stack'

export * from '@mesa/component'
export * from '@mesa/util'

export default module.exports
