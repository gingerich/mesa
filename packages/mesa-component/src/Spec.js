const debug = require('debug')('mesa:spec');

export class Spec {
  static of(type, config) {
    return new this(type, config, subcomponents);
  }

  static make(spec, context) {
    const { type, config } = spec;

    const typeFactory = makeTypeFactory(type);

    return typeFactory({ ...config }, context);
  }

  constructor(type, config = {}) {
    this.type = type;
    this.config = { ...type.defaultConfig, ...config };
    this.config.subcomponents = this.config.subcomponents || [];
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
    }
    // this.registry.decorator('component', refDecorator)
    return this;
  }

  // make (context) {
  //   const { factory, config, subcomponents } = this
  //   // const TypeConstructor = makeTypeConstructor(factory)
  //   const typeFactory = makeTypeFactory(factory)

  //   return typeFactory({ ...config, subcomponents }, context)//, ...deps)
  // }

  // compose (context) {
  //   return compose(this, context)
  // }
}

function makeTypeFactory(Type) {
  return (...args) =>
    Object.prototype.hasOwnProperty.call(Type, 'prototype') ? new Type(...args) : Type(...args);
}

export default Spec;
