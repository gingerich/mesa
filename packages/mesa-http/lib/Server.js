'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.ExtractMsg = exports.Server = void 0

var _koa = _interopRequireDefault(require('koa'))

var _koaBodyparser = _interopRequireDefault(require('koa-bodyparser'))

var _koaCompress = _interopRequireDefault(require('koa-compress'))

var _koaHelmet = _interopRequireDefault(require('koa-helmet'))

var _koaMorgan = _interopRequireDefault(require('koa-morgan'))

var _koaMount = _interopRequireDefault(require('koa-mount'))

var _koaResponseTime = _interopRequireDefault(require('koa-response-time'))

var _component = require('@mesa/component')

var _core = _interopRequireDefault(require('@mesa/core'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

// import { Stack } from '@mesa/core'
class Server {
  static listen(component, ...args) {
    return new Server().use(component).listen(...args)
  }

  constructor(options = {}) {
    this.options = options
    const upstream = []

    if (options.msgFromRequest) {
      const transform = (ctx, next) => next(options.msgFromRequest(ctx))

      upstream.push(_core.default.use(transform))
    }

    this.service = _core.default.createService({
      upstream
    }) // this.middleware = []
  }

  use(...middleware) {
    this.service.use(...middleware) // this.middleware.push(...middleware)

    return this
  }

  action(pattern, handler) {
    this.service.action(pattern, handler)
    return this
  } // rawMode () {
  //   this.options.msgFromRequest = ExtractMsg.rawRequest()
  //   return this
  // }

  listen(...args) {
    const server = new _koa.default() // Set X-Response-Time header
      .use((0, _koaResponseTime.default)()) // HTTP request logging
      .use((0, _koaMorgan.default)('combined', this.options.morgan)) // Request body parser
      .use((0, _koaBodyparser.default)(this.options.bodyParser)) // Allow compression
      .use((0, _koaCompress.default)(this.options.compress)) // Simple security configuration
      .use((0, _koaHelmet.default)(this.options.helmet)) // const { msgFromRequest = ExtractMsg.fromBody() } = this.options
    // const middleware = compose(Stack.spec().use(this.middleware))

    const serviceMiddleware = async (ctx, next) => {
      const response = await this.service.call(ctx, msg =>
        next().then(() => msg)
      ) // const response = await this.service.call(msgFromRequest(ctx), function (msg) {
      //   return next().then(() => msg)
      // })
      // if (response) {

      ctx.body = response || null // }
    }

    const serviceMount = this.options.prefix
      ? (0, _koaMount.default)(this.options.prefix, serviceMiddleware)
      : serviceMiddleware
    server.use(serviceMount)
    return server.listen(...args)
  }
}

exports.Server = Server
const ExtractMsg = {
  rawRequest: () => ctx => next(ctx),
  fromBody: () => ctx => ctx.request.body
}
exports.ExtractMsg = ExtractMsg
