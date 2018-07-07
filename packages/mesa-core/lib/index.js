"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  transport: true,
  component: true,
  createService: true
};
exports.transport = transport;
exports.component = component;
exports.createService = createService;
exports.default = void 0;

var _component = require("@mesa/component");

Object.keys(_component).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _component[key];
    }
  });
});

var _Service = _interopRequireDefault(require("./Service"));

var _namespace = _interopRequireDefault(require("./namespace"));

var _transport = _interopRequireDefault(require("./transport"));

var _plugins = require("./plugins");

Object.keys(_plugins).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _plugins[key];
    }
  });
});

var _context = require("./context");

Object.keys(_context).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _context[key];
    }
  });
});

var _Match = require("./common/Match");

Object.keys(_Match).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Match[key];
    }
  });
});

var _Stack = require("./common/Stack");

Object.keys(_Stack).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Stack[key];
    }
  });
});

var _util = require("@mesa/util");

Object.keys(_util).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _util[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createService(options = {}) {
  const ns = (0, _namespace.default)({
    match: {
      nested: true
    }
  });
  const service = new _Service.default(ns);
  const Context = {}; // TODO?

  if (typeof options === 'function') {
    options = options(Context);
  } else if (typeof options === 'string') {
    options = {
      name: options
    };
  } // Catch unhandled errors


  service.use(async (msg, next) => {
    try {
      return await next(msg);
    } catch (e) {
      console.error(e);
    }
  });
  const {
    upstream = [],
    actions = []
  } = options;

  if (typeof upstream === 'function') {
    const decorate = upstream;
    upstream = [() => decorate(service)];
  }

  if (typeof actions === 'function') {
    const decorate = actions;
    actions = [() => decorate(service)];
  }

  const plugins = [...upstream, // Use default namespace
  () => service.use(ns.router()), ...actions];
  plugins.forEach(plug => plug(service));
  return service;
}

function transport(options) {
  return new _transport.default(options);
}

function component(fn) {
  return _component.Component.of(fn);
}

var _default = module.exports;
exports.default = _default;