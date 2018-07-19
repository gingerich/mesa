import pathToRegexp from 'path-to-regexp'
// import routington from 'routington'

import { Component, Spec, extension } from '@mesa/core'
import { methods } from './Method'
import Mount from './Mount'
import Layer from './Layer'
import Route from './Route'

const debug = require('debug')('mesa-http:router')

export class Router extends Component {
  compose() {
    return Mount.path(this.config.path).use(this.config.subcomponents)

    // return Provider.spec({ value: { params: {} } })
    //   .use(
    //     Mount.path(this.config.path)
    //       .use(this.config.subcomponents)
    //   )
  }
}

Router.plugins = extension()
  .plugin('all', function(path, ...middleware) {
    this.use(Route.spec({ ...this.config, path })).use(middleware)
    return this
  })
  .plugin('route', function(path, controller) {
    const layer = Layer.spec({ ...this.config, path }).use(controller) //.path(path))
    return this.use(layer)
  })
  .plugin('param', function(name, fn) {
    ;(this.config.params[name] = this.config.params[name] || []).push(fn)
    return this
  })
  .plugin(
    methods.reduce((plugins, method) => {
      plugins[method] = function(path, ...middleware) {
        const { params } = this.config
        const route = Route.spec({ method, path, params }).use(middleware)
        this.use(route)
        return this
      }
      return plugins
    }, {})
  )
  .plugin('del', 'delete') // delete() aliased to del()
  .plugin('controller', 'route') // route() aliased to controller()

Router.Spec = class RouterSpec extends Spec {
  constructor(type, config, subcomponents) {
    super(type, { params: {}, ...config }, subcomponents)
    this.routes = {}
  }

  use(...components) {
    if (typeof components[0] === 'string') {
      const path = components.shift()
      const config = {
        path,
        params: this.config.params,
        options: { end: false } // ?
      }
      const layer = Layer.spec(config).use(components)
      return this.use(layer)
    }

    return super.use(...components)
  }
}

export function router(config) {
  return Router.spec(config)
}

export default Router
