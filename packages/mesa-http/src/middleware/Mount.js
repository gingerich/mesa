import Mesa from '@mesa/core';
import mount from 'koa-mount';

const debug = require('debug')('mesa-http:mount');

export class Mount extends Mesa.Component {
  static path(path, ...components) {
    return Mount.spec({ path }).use(...components);
  }

  compose(middleware) {
    const { path = '/' } = this.config;
    if (path === '/') {
      debug("Useless mount for path '/'");
    }
    return mount(path, middleware());
  }
}

export default Mount;

// Mount.plugins = extension((proto) => {
//   // const use = proto.use
//   proto.use = (...components) => {
//     if (typeof components[0] === 'string') {
//       const path = components.shift()
//       return this.use(Mount.spec({ path }).use(...components))
//     }
//     // return use(...components)
//     if (Array.isArray(components[0])) {
//       components = components[0]
//     }
//     this.useComponents(components)
//     return this
//   }
// })
