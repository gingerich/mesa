"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Client = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _core = _interopRequireDefault(require("@mesa/core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

class Client extends _core.default.Component {
  static of(url) {
    return Client.spec({
      url
    });
  }

  compose(compose) {
    const middleware = compose(this.config.subcomponents);

    const _config = this.config,
          {
      url
    } = _config,
          fetchOpts = _objectWithoutProperties(_config, ["url"]);

    return msg => {
      const options = _objectSpread({}, fetchOpts, {
        method: 'POST',
        body: JSON.stringify(msg)
      });

      options.headers = _objectSpread({}, options.headers, {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      });
      return (0, _nodeFetch.default)(url, options).then(res => res.json()).then(middleware);
    };
  }

}

exports.Client = Client;
var _default = Client;
exports.default = _default;