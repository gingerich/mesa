'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = exports.Except = void 0

var _component = require('@mesa/component')

var _util = require('@mesa/util')

var _Condition = _interopRequireDefault(require('./Condition'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

class Except extends _component.Component {
  compose() {
    const { matches = [] } = this.config
    return _Condition.default.on
      .not((0, _util.matching)(matches))
      .use(this.config.subcomponents)
  }
}

exports.Except = Except
var _default = Except
exports.default = _default
