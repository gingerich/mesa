import get from 'lodash.get'
import requireDirectory from 'require-directory'

import Mesa from '@mesa/core'
import Mount from './Mount'
import Router from './Router'
import Stack from './Stack'

export class Module extends Mesa.Component {
  static routes() {
    return []
  }

  get path() {
    return this.config.path || this.constructor.PATH
  }

  get directory() {
    return this.config.directory
  }

  get routes() {
    if (typeof this.constructor.routes === 'function') {
      return this.constructor.routes()
    }
    return this.config.routes || []
  }

  extend(spec) {
    return spec
  }

  compose() {
    const {
      routes = [],
      loader = new Loader(),
      orderSubcomponents = 'pre'
    } = this.config
    const routesList = this.constructor.routes(this.config)
    routesList.push(...routes)

    loader.use(routesPlugin(routesList))

    const spec = Mount.spec({ path: this.path })

    if (orderSubcomponents === 'pre') {
      spec.use(this.config.subcomponents)
    }

    const loaded = loader.load(this.directory, this.config.requireDir)
    spec.use(loaded)

    if (orderSubcomponents === 'post') {
      spec.use(this.config.subcomponents)
    }

    this.extend(spec)

    return spec
  }
}

function routesPlugin(routes) {
  return contents => {
    const addRoute = (router, component) => {
      if (typeof component === 'function') {
        return router.use(component)
      }
      if (typeof component === 'string') {
        component = { name: component }
      }
      const Class = contents(component.name)
      if (!Class) {
        throw new Error(`${component.name} does not match any component`)
      }
      let spec = Class.spec(component.config)
      if (component.except) {
        spec = spec.except(component.except)
      }
      const method = component.method || 'use'
      const args = []
      if (component.path) {
        args.push(component.path)
      }
      if (component.middleware) {
        const stack = component.middleware.reduce(addRoute, Stack.spec())
        args.push(stack)
      }
      args.push(spec)
      return router[method.toLowerCase()](...args)
    }
    return routes.reduce(addRoute, Router.spec())
  }
}

export class Loader {
  static loadDir(dirname, options) {
    const opts = Object.assign(
      {},
      {
        include: /^([^\.].+)\.js(on)?$/,
        recursive: true,
        visit: obj => obj.default || obj, // es6 compat
        rename: name => name.replace(/(_\w)/g, m => m[1].toUpperCase()) // snake_case to camelCase
      },
      options
    )

    return requireDirectory(module, dirname, opts)
  }

  constructor() {
    this.plugins = []
  }

  use(selector, plugin) {
    if (typeof selector !== 'string') {
      plugin = selector
      selector = undefined
    }
    if (typeof plugin !== 'function') {
      throw new Error('plugin must be a function')
    }
    this.plugins.push({ selector, plugin })
    return this
  }

  load(dirname, options) {
    let contents
    try {
      contents = Loader.loadDir(dirname, options)
    } catch (e) {
      throw new Error(`Unable to load module from ${dirname}`)
    }
    return this.plugins.map(({ selector, plugin }) => {
      let selected = selector ? get(contents, selector, {}) : contents
      selected = Object.assign(get.bind(null, selected), selected)
      return plugin(selected)
    })
  }
}

export default module.exports
