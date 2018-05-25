"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Stack = void 0;

var _component = require("@mesa/component");

class Stack extends _component.Component {
  compose({
    compose
  }) {
    const {
      reverse,
      subcomponents
    } = this.config;
    const middleware = reverse ? [...subcomponents].reverse() : subcomponents;
    return compose(middleware);
  }

}

exports.Stack = Stack;
var _default = Stack;
exports.default = _default;