"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Router = void 0;

var _component = require("@mesa/component");

var _Stack = _interopRequireDefault(require("./common/Stack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Router extends _component.Component {
  static destructure(key) {
    return Router.spec({
      destructure: key
    });
  }

  compose(stack) {
    return (ctx, next) => {
      // Lookup handlers for msg
      const match = this.config.match(ctx.msg); // No handlers to accept msg

      if (!match) {
        return next(ctx);
      }

      const {
        destructure,
        balanceComponent = _Stack.default.spec()
      } = this.config; // Optionally destructure msg

      const {
        [destructure]: payload
      } = ctx.msg;

      if (payload) {
        ctx.msg = payload;
      }

      const balancer = balanceComponent.use(match.node.handlers);
      const handler = stack.compose([balancer]);
      return handler(ctx, ({
        msg
      }) => msg);
    };
  }

}

exports.Router = Router;
var _default = Router;
exports.default = _default;