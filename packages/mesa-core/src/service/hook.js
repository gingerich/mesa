import { compose } from '@mesa/component'
import memoize from 'mem'

const mCompose = memoize(compose)

export class Hooks {
  constructor() {
    this.hooks = {}
  }

  register(name, component) {
    const { [name]: hook = [] } = this.hooks
    hook.push(component)
  }

  get(name) {
    const { [name]: hook = [] } = this.hooks
    return mCompose(hook)
  }
}
