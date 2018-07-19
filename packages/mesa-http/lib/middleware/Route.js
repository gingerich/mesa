'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Route = void 0

var _core = _interopRequireDefault(require('@mesa/core'))

var _Layer = _interopRequireDefault(require('./Layer'))

var _Method = _interopRequireDefault(require('./Method'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

class Route extends _core.default.Component {
  compose() {
    const { method, path, params } = this.config
    return _Method.default
      .spec({
        method
      })
      .use(
        _Layer.default
          .spec({
            path,
            params
          })
          .use(this.config.subcomponents)
      )
  }
}

exports.Route = Route
var _default = Route
exports.default = _default
