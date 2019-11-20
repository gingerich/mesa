import { compose } from '@mesa/component';
import memoize from 'mem';

const mCompose = memoize(compose);

export class Hooks {
  constructor() {
    this.hooks = {};
  }

  register(name, component) {
    const { [name]: hook } = this.hooks;
    if (!hook) {
      hook = this.hooks[name] = [];
    }
    hook.push(component);
  }

  get(name) {
    const { [name]: hook = [] } = this.hooks;
    return mCompose(hook);
  }
}
