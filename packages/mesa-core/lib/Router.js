"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Router = void 0;

var _Component = _interopRequireDefault(require("./Component"));

var _Stack = _interopRequireDefault(require("./common/Stack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Router extends _Component.default {
  static destructure(key) {
    return Router.spec({
      destructure: key
    });
  }

  compose({
    compose
  }) {
    return (msg, next) => {
      // Lookup handlers for msg
      const match = this.config.match(msg); // No handlers to accept msg

      if (!match) {
        return next(msg);
      }

      const {
        destructure,
        balanceComponent = _Stack.default.spec()
      } = this.config; // Optionally destructure msg

      const {
        [destructure]: payload
      } = msg;

      if (payload) {
        msg = payload;
      }

      const balancer = balanceComponent.use(match.node.handlers);
      const handler = compose([balancer]); // Don't pass next at the namespace level

      return handler(msg); // const handler = compose(match.node.handlers)
      // return handler(msg)
    };
  }

}

exports.Router = Router;
var _default = Router;
exports.default = _default;