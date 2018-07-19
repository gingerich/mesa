'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
var _exportNames = {
  server: true,
  client: true,
  listen: true,
  plugin: true,
  transport: true,
  koaMiddleware: true
}
exports.server = server
exports.client = client
exports.listen = listen
exports.plugin = plugin
exports.transport = transport
exports.koaMiddleware = koaMiddleware
exports.default = void 0

var _Client = require('./Client')

Object.keys(_Client).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Client[key]
    }
  })
})

var _Server = require('./Server')

Object.keys(_Server).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Server[key]
    }
  })
})

var _Controller = require('./middleware/Controller')

Object.keys(_Controller).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Controller[key]
    }
  })
})

var _Layer = require('./middleware/Layer')

Object.keys(_Layer).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Layer[key]
    }
  })
})

var _Method = require('./middleware/Method')

Object.keys(_Method).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Method[key]
    }
  })
})

var _Params = require('./middleware/Params')

Object.keys(_Params).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Params[key]
    }
  })
})

var _Path = require('./middleware/Path')

Object.keys(_Path).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Path[key]
    }
  })
})

var _Route = require('./middleware/Route')

Object.keys(_Route).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Route[key]
    }
  })
})

var _Router = require('./middleware/Router')

Object.keys(_Router).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Router[key]
    }
  })
})

var _Request = require('./Request')

Object.keys(_Request).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _Request[key]
    }
  })
})

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {}
    var ownKeys = Object.keys(source)
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(
        Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable
        })
      )
    }
    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key])
    })
  }
  return target
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    })
  } else {
    obj[key] = value
  }
  return obj
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {}
  var target = {}
  var sourceKeys = Object.keys(source)
  var key, i
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i]
    if (excluded.indexOf(key) >= 0) continue
    target[key] = source[key]
  }
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source)
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i]
      if (excluded.indexOf(key) >= 0) continue
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue
      target[key] = source[key]
    }
  }
  return target
}

function server(opts) {
  return new _Server.Server(opts)
}

function client(opts) {
  return _Client.Client.spec(opts)
}

function listen(component, ...args) {
  return server()
    .use(component)
    .listen(...args)
}

function plugin(opts) {
  return mesa => listen(mesa, opts)
}

function transport(options) {
  return _ref => {
    let { service } = _ref,
      transport = _objectWithoutProperties(_ref, ['service'])

    const serverOpts = _objectSpread(
      {
        prefix: '/call',
        msgFromRequest: Http.ExtractMsg.fromBody()
      },
      options
    )

    const http = server(serverOpts)
    http.use(service)
    transport.listen((...args) => http.listen(...args))
    transport.client((action, ...args) =>
      service.action(action, client(...args))
    )
  }
}

function koaMiddleware(component) {
  return async function(ctx, next) {
    const res = await compose(
      component
      /* context? */
    )(ctx, function(msg) {
      return next().then(() => msg)
    })
    if (res) ctx.body = res
  }
}

var _default = module.exports
exports.default = _default
