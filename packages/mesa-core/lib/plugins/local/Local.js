"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Local = void 0;

var _component = require("@mesa/component");

/*
* Matches incoming message against locally registered patterns
* Calls next() if none match
*/
class Local extends _component.Component {
  compose() {
    const {
      lookup
    } = this.config;
    return (msg, next) => {
      const handler = lookup(msg);

      if (handler) {
        return (0, _component.compose)(handler, this.context)(msg, next);
      }

      return next(msg);
    };
  }

}

exports.Local = Local;
var _default = Local;
exports.default = _default;