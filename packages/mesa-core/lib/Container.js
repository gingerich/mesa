"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Container = void 0;

var _component = require("@mesa/component");

var _Stack = _interopRequireDefault(require("./common/Stack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Container extends _component.Component {
  get mesa() {
    return this.config.mesa;
  }

  setNext(next) {
    this.next = next;
  } // getChildContext () {
  //   return this
  // }


  call(msg) {
    return this.mesa.call(msg);
  }

  defer(msg) {
    if (!this.next) {
      return Promise.resolve(msg);
    }

    return this.next(msg);
  }

  compose({
    compose
  }) {
    // return compose([
    //   ...this.config.subcomponents,
    //   // Unhandled messages will return null
    //   ctx => null
    // ])
    return _Stack.default.spec().use(this.config.subcomponents); // Unhandled messages should return null
    // .use(ctx => null)
  }

}

exports.Container = Container;
var _default = Container;
exports.default = _default;