"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Next = void 0;

var _Component = _interopRequireDefault(require("./Component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Next extends _Component.default {
  compose() {
    return (ctx, next) => {
      const {
        skip = false,
        use = next
      } = this.config;
      return skip || use();
    };
  }

}

exports.Next = Next;
var _default = Next;
exports.default = _default;