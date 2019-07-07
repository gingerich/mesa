import { uuid } from '../utils'

const baseContext = {
  call(...args) {
    return this.service.call(...args)
  },
  defer() {
    return this.msg
  },
  hook(name) {
    return this.service.hooks.get(name).bind(this, this)
  },
  configure(...args) {
    Object.assign(this.config, ...args)
  },
  get id() {
    if (!this._id) {
      this._id = uuid()
    }
    return this._id
  },
  set id(id) {
    this._id = id
  }
}

export const create = (service, msg, extendedContext) => {
  const context = Object.create({ ...baseContext, ...extendedContext })
  context.config = Object.create(service.config)
  context.service = service
  context.msg = msg
  return context
}

// const Context = Schema.extend(() => ({
//   call(...args) {
//     return this.service.call(...args)
//   },
//   defer() {
//     return this.msg
//   },
//   hook(name) {
//     return this.service.hooks.get(name).bind(this, this)
//   },
//   configure(...args) {
//     Object.assign(this.config, ...args)
//   },
//   get id() {
//     if (!this._id) {
//       this._id = uuid()
//     }
//     return this._id
//   },
//   set id(id) {
//     this._id = id
//   }
// }))

// export default Context
