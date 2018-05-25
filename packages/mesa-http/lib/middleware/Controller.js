"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Controller = void 0;

var _core = _interopRequireDefault(require("@mesa/core"));

var _common = require("@mesa/common");

var _Method = _interopRequireDefault(require("./Method"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('mesa-http:controller'); // const route = require('koa-path-match')()
// @path('/:id')


class Controller extends _core.default.Component {
  compose() {
    return _Method.default.methods.reduce((stack, method) => {
      const {
        [method]: handler
      } = this.config;

      if (!handler) {
        return stack;
      }

      const wrapper = ctx => handler.call(this, ctx);

      return stack.use(_Method.default.spec({
        method
      }).use(wrapper));
    }, _common.Stack.spec()); // const controller = this.config.controller || this
    // const path = this.constructor.PATH || this.config.path || '/'
    // const router = route(path)
    // const handledMethods = []
    // methods.forEach((method) => {
    //   const handler = controller[method]
    //   if (handler) {
    //     if (typeof (handler) !== 'function') {
    //       throw new Error(`Expected controller.${method} to be a function`)
    //     }
    //     handledMethods.push(method)
    //     router[method]((ctx) => {
    //       const res = handler.call(controller, ctx)
    //       if (res !== undefined) {
    //         if (ctx.body !== undefined) {
    //           debug('Unexpected return value when ctx.body is already set')
    //         }
    //         ctx.body = res
    //       }
    //     })
    //   }
    // })
    // debug(`[${handledMethods}] ${path}`)
    // return router
  }

}

exports.Controller = Controller;
var _default = Controller;
exports.default = _default;