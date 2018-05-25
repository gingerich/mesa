"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Match = void 0;

var _Component = _interopRequireDefault(require("./Component"));

var _Accept = _interopRequireDefault(require("./Accept"));

var _Except = _interopRequireDefault(require("./Except"));

var _Spec = _interopRequireDefault(require("../Spec"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('mesa:match');

class Match extends _Component.default {
  static accept(accept) {
    return Match.spec({
      accept
    });
  }

  static except(except) {
    return Match.spec({
      except
    });
  }

  compose() {
    return _Accept.default.spec({
      matches: this.config.accept
    }).use(_Except.default.spec({
      matches: this.config.except
    }).use(this.config.subcomponents));
  }

}

exports.Match = Match;
Match.Spec = class MatchSpec extends _Spec.default {
  constructor(type, config, subcomponents) {
    super(type, config, subcomponents);
    this.config.accept = toArray(this.config.accept);
    this.config.except = toArray(this.config.except);
  }

  accept(accept) {
    this.config.accept = this.config.accept.concat(accept);
    return this;
  }

  except(except) {
    this.config.except = this.config.except.concat(except);
    return this;
  }

};

const toArray = (val = []) => Array.isArray(val) ? val : [val];

var _default = Match;
exports.default = _default;