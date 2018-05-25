"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Next = void 0;

var _component = require("@mesa/component");

class Next extends _component.Component {
  compose() {
    return (ctx, next) => {
      const {
        skip = false,
        use = next
      } = this.config;
      return skip || use(ctx);
    };
  }

}

exports.Next = Next;
var _default = Next;
exports.default = _default;