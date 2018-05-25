"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Component = void 0;

var _component = require("@mesa/component");

class Component extends _component.Component {
  /*
  * Send a message
  */
  call(msg) {
    if (!this.context.call) {
      return Promise.resolve();
    }

    return this.context.call(msg);
  }
  /*
  * Defer to previous handler
  */


  defer(msg) {
    if (!this.context.defer) {
      return Promise.resolve(msg);
    }

    return this.context.defer(msg);
  }

}

exports.Component = Component;
var _default = Component;
exports.default = _default;