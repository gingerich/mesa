"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Mount = void 0;

var _core = _interopRequireDefault(require("@mesa/core"));

var _koaMount = _interopRequireDefault(require("koa-mount"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('mesa-http:mount');

class Mount extends _core.default.Component {
  static path(path, ...components) {
    return Mount.spec({
      path
    }).use(...components);
  }

  compose(middleware) {
    const {
      path = '/'
    } = this.config;

    if (path === '/') {
      debug("Useless mount for path '/'");
    }

    return (0, _koaMount.default)(path, middleware());
  }

}

exports.Mount = Mount;
var _default = Mount; // Mount.plugins = extension((proto) => {
//   // const use = proto.use
//   proto.use = (...components) => {
//     if (typeof components[0] === 'string') {
//       const path = components.shift()
//       return this.use(Mount.spec({ path }).use(...components))
//     }
//     // return use(...components)
//     if (Array.isArray(components[0])) {
//       components = components[0]
//     }
//     this.useComponents(components)
//     return this
//   }
// })

exports.default = _default;