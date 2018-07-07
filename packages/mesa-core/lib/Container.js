"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Container = void 0;

var _component = require("@mesa/component");

var _Stack = _interopRequireDefault(require("./common/Stack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Container extends _component.Component {
  compose() {
    return _Stack.default.spec().use(this.config.subcomponents);
  }

}

exports.Container = Container;
var _default = Container;
exports.default = _default;