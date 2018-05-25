"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Accept = void 0;

var _component = require("@mesa/component");

var _util = require("@mesa/util");

var _Condition = _interopRequireDefault(require("./Condition"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Accept extends _component.Component {
  compose() {
    const {
      matches = []
    } = this.config;
    return _Condition.default.on((0, _util.matching)(matches)).use(this.config.subcomponents);
  }

}

exports.Accept = Accept;
var _default = Accept;
exports.default = _default;