'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.createService = createService

var _namespace = _interopRequireDefault(require('./namespace'))

var _service = require('./service')

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function createService(options = {}) {
  const ns = (0, _namespace.default)({
    match: {
      nested: true
    }
  })
  const service = new _service.Service(ns)
  const Context = {} // TODO?

  if (typeof options === 'function') {
    options = options(Context)
  } else if (typeof options === 'string') {
    options = {
      name: options
    }
  } // Catch unhandled errors

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
    ...upstream, // Use default namespace
    () => service.use(ns.router()),
    ...actions
  ]
  plugins.forEach(plug => plug(service))
  return service
}
