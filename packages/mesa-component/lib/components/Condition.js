"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Branch = exports.Condition = void 0;

var _Component = _interopRequireDefault(require("./Component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Condition extends _Component.default {
  static on(condition) {
    return Condition.spec({
      condition
    });
  }

  compose(middleware) {
    const downstream = middleware.compose();
    const {
      condition
    } = this.config;

    const conditionFn = ctx => {
      if (typeof condition !== 'function') {
        return condition;
      }

      return condition(ctx);
    };

    return async (ctx, next) => {
      const result = await conditionFn(ctx);
      if (!result && !this.config.negative) return next();else if (result && this.config.negative) return next(); // return downstream(ctx, () => branching || next())

      return downstream(ctx, next);
    };
  }

} // Condition.plugins = extension().plugin('on', on)
// Condition.on = function (condition) {
//   return Condition.spec({ condition })
// }


exports.Condition = Condition;

Condition.on.not = function (condition) {
  return Condition.spec({
    condition,
    negative: true
  });
};

class Branch extends _Component.default {
  compose() {
    const {
      condition
    } = this.config;
    return Condition.spec({
      condition
    }).use(this.config.subcomponents).use(() => {});
  }

} // Branch.plugins = extension(Condition.plugins)


exports.Branch = Branch;
var _default = Condition;
exports.default = _default;