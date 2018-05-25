"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Except = void 0;

var _Component = _interopRequireDefault(require("./Component"));

var _Condition = _interopRequireDefault(require("./Condition"));

var _matching = _interopRequireDefault(require("../matching"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Except extends _Component.default {
  compose() {
    const {
      matches = []
    } = this.config;
    return _Condition.default.on.not((0, _matching.default)(matches)).use(this.config.subcomponents);
  }

}

exports.Except = Except;
var _default = Except;
exports.default = _default;