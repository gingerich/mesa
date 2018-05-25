"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Stack = void 0;

var _Component = _interopRequireDefault(require("./Component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Stack extends _Component.default {
  compose(middleware) {
    return middleware.compose();
  }

}

exports.Stack = Stack;
var _default = Stack;
exports.default = _default;