import Mesa from '@mesa/core';
import Path from './Path';
import Params from './Params';

export class Layer extends Mesa.Component {
  // get path () {
  //   return this.config.path
  // }

  compose() {
    const { path, params } = this.config;

    return Path.spec({ path })
      .use(Params.spec({ params }))
      .use(this.config.subcomponents);
  }
}

export default Layer;
