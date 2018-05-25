"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Local", {
  enumerable: true,
  get: function () {
    return _Local.default;
  }
});
exports.default = exports.plugin = void 0;

var _Local = _interopRequireDefault(require("./Local"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const plugin = () => mesa => {
  mesa.use(_Local.default.spec({
    lookup: msg => mesa.getHandler(msg)
  }));
};

exports.plugin = plugin;
var _default = plugin;
exports.default = _default;