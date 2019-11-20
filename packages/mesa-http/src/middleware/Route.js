import Mesa from '@mesa/core';
import Layer from './Layer';
import Method from './Method';

export class Route extends Mesa.Component {
  compose() {
    const { method, path, params } = this.config;
    return Method.spec({ method }).use(Layer.spec({ path, params }).use(this.config.subcomponents));
  }
}

export default Route;
