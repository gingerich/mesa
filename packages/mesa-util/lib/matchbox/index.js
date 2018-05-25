"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchbox = matchbox;

require("core-js/modules/es6.array.sort");

var _match = _interopRequireDefault(require("./match"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getOrderedEntries(obj) {
  return Object.keys(obj).sort().reduce((entries, key) => {
    entries.push([key, obj[key]]);
    return entries;
  }, []);
}

class Node {
  constructor(value) {
    this.value = value;
  }

}

class Matchbox {
  constructor(options) {
    this.options = options;
    this.nodes = new Map();
  }

  define(pattern) {
    const ordered = getOrderedEntries(_objectSpread({}, pattern)); // const key = ordered.join('')

    const key = JSON.stringify(ordered);

    if (!this.nodes.has(key)) {
      const node = new Node(ordered, pattern);
      this.nodes.set(key, node);
    }

    return this.nodes.get(key);
  }

  get(pattern) {
    const ordered = getOrderedEntries(pattern);
    const key = ordered.join('');
    return this.nodes.get(key);
  }

  remove(pattern) {
    const ordered = getOrderedEntries(pattern);
    const key = ordered.join('');
    return this.nodes.delete(key);
  }

  match(input, strict) {
    const ordered = getOrderedEntries(_objectSpread({}, input));
    const patterns = [...this.nodes.values()];

    if (!patterns.length) {
      return;
    }

    const node = this.options.match(patterns, ordered, strict);
    return node;

    if (node) {
      return {
        node
      };
    }
  }

}

function matchbox(opts = {}) {
  const match = (0, _match.default)({
    matchValues(patternVal, inputVal, strict) {
      if (typeof patternVal === 'function') {
        return patternVal(inputVal);
      }

      if (typeof patternVal === 'string' && patternVal.endsWith('*')) {
        return inputVal.startsWith(patternVal.slice(0, -1));
      }

      if (patternVal instanceof RegExp) {
        return patternVal.test(inputVal);
      }

      if (typeof patternVal === 'object' && opts.nested) {
        const patterns = [new Node(getOrderedEntries(patternVal))];
        return !!match(patterns, getOrderedEntries(_objectSpread({}, inputVal)), strict);
      }

      return patternVal === inputVal;
    }

  });
  return new Matchbox(_objectSpread({}, opts, {
    match
  }));
}