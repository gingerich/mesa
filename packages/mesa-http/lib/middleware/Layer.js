'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Layer = void 0

var _core = _interopRequireDefault(require('@mesa/core'))

var _Path = _interopRequireDefault(require('./Path'))

var _Params = _interopRequireDefault(require('./Params'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

class Layer extends _core.default.Component {
  // get path () {
  //   return this.config.path
  // }
  compose() {
    const { path, params } = this.config
    return _Path.default
      .spec({
        path
      })
      .use(
        _Params.default.spec({
          params
        })
      )
      .use(this.config.subcomponents)
  }
}

exports.Layer = Layer
var _default = Layer
exports.default = _default
