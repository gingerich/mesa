"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Spec = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// import compose from 'koa-compose'
// import Component from '../components/Component'
// import Except from '../components/Except'
// import Mount from '../components/Mount'
const debug = require('debug')('mesa:spec');

class Spec {
  static of(type, config, ...subcomponents) {
    return new this(type, config, subcomponents);
  }

  static make(spec, context) {
    const {
      type,
      config
    } = spec;
    const typeFactory = makeTypeFactory(type);
    return typeFactory(_objectSpread({}, config), context);
  }

  constructor(type, config = {}, subcomponents = []) {
    this.type = type; // this.config = config

    this.config = _objectSpread({
      subcomponents
    }, config); // this.subcomponents = subcomponents.slice(0)
  }

  set(key, value) {
    if (typeof key === 'object') {
      Object.assign(this.config, key);
    } else {
      this.config[key] = value;
    }

    return this;
  }

  use(...components) {
    if (Array.isArray(components[0])) {
      components = components[0];
    }

    this.config.subcomponents.push(...components);
    return this;
  }

  subcomponents(value) {
    this.config.subcomponents = value;
    return this;
  }

  ref(fn) {
    function refDecorator(instance) {
      fn(instance);
      return instance;
    } // this.registry.decorator('component', refDecorator)


    return this;
  } // make (context) {
  //   const { factory, config, subcomponents } = this
  //   // const TypeConstructor = makeTypeConstructor(factory)
  //   const typeFactory = makeTypeFactory(factory)
  //   return typeFactory({ ...config, subcomponents }, context)//, ...deps)
  // }
  // compose (context) {
  //   return compose(this, context)
  // }


}

exports.Spec = Spec;

function makeTypeFactory(Type) {
  return (...args) => Object.prototype.hasOwnProperty.call(Type, 'prototype') ? new Type(...args) : Type(...args);
}

var _default = Spec;
exports.default = _default;