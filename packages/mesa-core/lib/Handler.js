"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Handler = void 0;

var _component = require("@mesa/component");

var _Stack = _interopRequireDefault(require("./common/Stack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Handler extends _component.Component {
  compose(substream) {
    return (0, _component.compose)(substream(), this.context);
  }

}

exports.Handler = Handler;
var _default = Handler;
exports.default = _default;