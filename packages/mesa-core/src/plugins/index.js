export function use(component) {
  return service => service.use(component)
}

export function action(pattern, handler) {
  return service => service.action(pattern, handler)
}

export function ns(namespace, ...actions) {
  if (Array.isArray(actions[0])) {
    actions = actions[0]
  }

  return service =>
    actions.reduce((ns, action) => action(ns), service.ns(namespace))
}

export function register(broker) {
  return service => broker.use(service)
}

export default module.exports
