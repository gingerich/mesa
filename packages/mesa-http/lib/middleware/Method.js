"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "methods", {
  enumerable: true,
  get: function () {
    return _methods.default;
  }
});
exports.default = exports.Method = void 0;

var _core = _interopRequireWildcard(require("@mesa/core"));

var _methods = _interopRequireDefault(require("methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Method extends _core.default.Component {
  static matches(method, matchMethod) {
    if (!matchMethod) return true;
    matchMethod = matchMethod.toUpperCase();
    if (method === matchMethod) return true;
    if (matchMethod === 'GET' && method === 'HEAD') return true;
    return false;
  }

  match(method) {
    return Method.matches(method, this.config.method);
  }

  compose() {
    return _core.Match.accept({
      method: method => this.match(method)
    }).use(this.config.subcomponents);
  }

}

exports.Method = Method;

_methods.default.forEach(method => {
  Method[method] = function (config) {
    return Method.spec(_objectSpread({}, config, {
      method
    }));
  };
});

var _default = Method;
exports.default = _default;