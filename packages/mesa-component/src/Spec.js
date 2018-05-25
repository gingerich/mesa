// import compose from 'koa-compose'

// import Component from '../components/Component'
// import Except from '../components/Except'
// import Mount from '../components/Mount'

const debug = require('debug')('mesa:spec')

function defineSubcomponents ({ subcomponents = [], ...config }) {
  Object.defineProperty(config, 'subcomponents', {
    value: subcomponents,
    writable: true
  })

  return config
}

export class Spec {
  static of (type, config/*, ...subcomponents*/) {
    return new this(type, config, subcomponents)
  }

  static make (spec, context) {
    const { type, config } = spec

    const typeFactory = makeTypeFactory(type)

    return typeFactory({ ...config }, context)
  }

  constructor (type, config = {}/*, subcomponents = []*/) {
    this.type = type
    // this.config = config
    this.config = defineSubcomponents(config)

    // this.config = {
    //   subcomponents: [],
    //   ...config
    // }

    // this.subcomponents = subcomponents.slice(0)
  }

  set (key, value) {
    if (typeof key === 'object') {
      Object.assign(this.config, key)
    } else {
      this.config[key] = value
    }
    return this
  }

  use (...components) {
    if (Array.isArray(components[0])) {
      components = components[0]
    }

    this.config.subcomponents.push(...components)
    return this
  }

  subcomponents (value) {
    this.config.subcomponents = value
    return this
  }

  ref (fn) {
    function refDecorator (instance) {
      fn(instance)
      return instance
    }
    // this.registry.decorator('component', refDecorator)
    return this
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

function makeTypeFactory (Type) {
  return (...args) =>
    Object.prototype.hasOwnProperty.call(Type, 'prototype') ?
      new Type(...args) : Type(...args)
}

export default Spec
