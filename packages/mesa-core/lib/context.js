"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContext = createContext;
exports.default = void 0;

var _component = require("@mesa/component");

function createContext(defaultValue) {
  const context = {
    currentValue: defaultValue,
    defaultValue
    /*
    * Ex.
    * Provider.spec({ value }))
    *   .use(
    *     Consumer.spec({ subcomponents: value => () => value })
    *   )
    */
    // class Provider extends Component {
    //   compose (middleware) {
    //     const handler = middleware.compose()
    //     return async (msg, next) => {
    //       const oldValue = context.currentValue
    //       context.currentValue = this.config.value
    //       const result = await handler(msg, (res) => {
    //         context.currentValue = oldValue
    //         return next(res)
    //       })
    //       context.currentValue = oldValue
    //       return result
    //     }
    //   }
    // }

    /*
    * Ex.
    * Stack.spec()
    *   .use(Provider.spec({ value }))
    *   .use(Consumer.spec({ subcomponents: value => () => value }))
    */

  };

  class Provider extends _component.Component {
    compose(stack) {
      const middleware = stack();
      return async (msg, next) => {
        const oldValue = context.currentValue;
        context.currentValue = this.config.value; // const result = await next(msg)

        const result = await middleware(msg, next);
        context.currentValue = oldValue;
        return result;
      };
    }

  }

  class Consumer extends _component.Component {
    compose() {
      return this.config.subcomponents(context.currentValue);
    }

  }

  Consumer._context = context;
  return {
    Provider,
    Consumer
  };
}

var _default = createContext;
exports.default = _default;