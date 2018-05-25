"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.router = router;
exports.default = exports.Router = void 0;

var _pathToRegexp = _interopRequireDefault(require("path-to-regexp"));

var _core = require("@mesa/core");

var _Method = require("./Method");

var _Mount = _interopRequireDefault(require("./Mount"));

var _Layer = _interopRequireDefault(require("./Layer"));

var _Route = _interopRequireDefault(require("./Route"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = require('debug')('mesa-http:router');

class Router extends _core.Component {
  compose() {
    return _Mount.default.path(this.config.path).use(this.config.subcomponents); // return Provider.spec({ value: { params: {} } })
    //   .use(
    //     Mount.path(this.config.path)
    //       .use(this.config.subcomponents)
    //   )
  }

}

exports.Router = Router;
Router.plugins = (0, _core.extension)().plugin('all', function (path, ...middleware) {
  this.use(_Route.default.spec(_objectSpread({}, this.config, {
    path
  }))).use(middleware);
  return this;
}).plugin('route', function (path, controller) {
  const layer = _Layer.default.spec(_objectSpread({}, this.config, {
    path
  })).use(controller); //.path(path))


  return this.use(layer);
}).plugin('param', function (name, fn) {
  (this.config.params[name] = this.config.params[name] || []).push(fn);
  return this;
}).plugin(_Method.methods.reduce((plugins, method) => {
  plugins[method] = function (path, ...middleware) {
    const {
      params
    } = this.config;

    const route = _Route.default.spec({
      method,
      path,
      params
    }).use(middleware);

    this.use(route);
    return this;
  };

  return plugins;
}, {})).plugin('del', 'delete') // delete() aliased to del()
.plugin('controller', 'route'); // route() aliased to controller()

Router.Spec = class RouterSpec extends _core.Spec {
  constructor(type, config, subcomponents) {
    super(type, _objectSpread({
      params: {}
    }, config), subcomponents);
    this.routes = {};
  }

  use(...components) {
    if (typeof components[0] === 'string') {
      const path = components.shift();
      const config = {
        path,
        params: this.config.params,
        options: {
          end: false // ?

        }
      };

      const layer = _Layer.default.spec(config).use(components);

      return this.use(layer);
    }

    return super.use(...components);
  }

};

function router(config) {
  return Router.spec(config);
}

var _default = Router;
exports.default = _default;