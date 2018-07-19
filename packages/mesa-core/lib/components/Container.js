'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.Container = void 0

var _component = require('@mesa/component')

var _common = require('./common')

class Container extends _component.Component {
  compose() {
    return _common.Stack.spec().use(this.config.subcomponents)
  }
}

exports.Container = Container
