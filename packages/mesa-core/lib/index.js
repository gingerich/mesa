"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  transport: true,
  use: true,
  action: true,
  ns: true,
  createService: true,
  createContext: true
};
exports.transport = transport;
exports.use = use;
exports.action = action;
exports.ns = ns;
exports.createService = createService;
Object.defineProperty(exports, "createContext", {
  enumerable: true,
  get: function () {
    return _context.createContext;
  }
});
exports.default = void 0;

var _Service = _interopRequireDefault(require("./Service"));

var _namespace = _interopRequireDefault(require("./namespace"));

var _transport = _interopRequireDefault(require("./transport"));

var _context = require("./context");

var _Namespace = require("./Namespace");

Object.keys(_Namespace).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Namespace[key];
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

function makeContext(service) {
  return {
    call(msg) {
      return service.call(msg);
    },

    service
  };
}

function createService(options = {}) {
  const ns = (0, _namespace.default)({
    nested: true
  });
  const service = new _Service.default(ns);
  const ctx = makeContext(service);
  const context = (0, _context.createContext)(ctx);
  service.Context = context.Consumer;

  if (typeof options === 'function') {
    options = options(context);
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
  }); // Expose context downstream

  const {
    isolate = true
  } = options;

  if (isolate) {
    service.use(context.Provider.spec({
      value: ctx
    }));
  } // Use default namespace
  // service.use(service.namespace)
  // service.use(ns.router())


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

function use(component) {
  return service => service.use(component);
}

function action(pattern, handler) {
  return service => service.action(pattern, handler);
}

function ns(namespace, ...actions) {
  if (Array.isArray(actions[0])) {
    actions = actions[0];
  }

  return service => actions.reduce((s, actn) => actn(s), service.ns(namespace));
}

var _default = module.exports;
exports.default = _default;