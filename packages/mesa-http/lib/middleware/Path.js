'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Path = void 0

var _core = _interopRequireWildcard(require('@mesa/core'))

var _pathToRegexp = _interopRequireDefault(require('path-to-regexp'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj
  } else {
    var newObj = {}
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc =
            Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {}
          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc)
          } else {
            newObj[key] = obj[key]
          }
        }
      }
    }
    newObj.default = obj
    return newObj
  }
}

const debug = require('debug')('mesa-http:path')

class Path extends _core.default.Component {
  constructor(config, context) {
    super(config, context)
    this.params = []
    this.regex = (0, _pathToRegexp.default)(
      config.path,
      this.params,
      config.options
    )
  }

  match(ctx) {
    const { consumeMatched = true } = this.config // const match = this.trie.match(ctx.path)

    const match = this.regex.exec(ctx.path)

    if (match) {
      // Optionally consume matched path so downstream components need not know path hierarchy
      if (consumeMatched) {
        ctx.path = ctx.path.replace(match[0], '') || '/'
      }

      debug(`match path ${match[0]} -> ${ctx.path}`) // ctx.params = match.param

      const args = match.slice(1).map(decode)
      ctx.params = {}
      args.forEach((arg, i) => {
        ctx.params[i] = arg
      }) // This is probably incorrect: test with "zero-or-more" feature

      this.params.forEach((param, i) => {
        ctx.params[param.name] = args[i]
      })
      ctx.parsedPath = {
        match,
        params: this.params,
        args
      }
      return true
    }

    return false
  }

  compose() {
    return _core.Match.accept(ctx => this.match(ctx)).use(
      this.config.subcomponents
    )
  }
}

exports.Path = Path

function decode(val) {
  return val ? decodeURIComponent(val) : null
}

var _default = Path
exports.default = _default
