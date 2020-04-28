import { uuid } from '@mesa/util';

const baseContext = {
  // cmd: 'REQUEST',
  call(action, msg, opts) {
    opts.cmd = 'REQUEST';
    return this.service.call(action, msg, opts);
  },
  emit(...args) {
    return this.service.emit(...args);
  },
  defer() {
    return this.msg;
  },
  hook(name) {
    return this.service.hooks.get(name).bind(this, this);
  },
  configure(...args) {
    Object.assign(this.config, ...args);
  },
  // get cmd() {
  //   return this.options.cmd
  // },
  get id() {
    if (!this._id) {
      this._id = uuid();
    }
    return this._id;
  },
  set id(id) {
    this._id = id;
  }
};

export const create = (service, msg, extendedContext, opts) => {
  const context = Object.create(Object.assign(baseContext, extendedContext));
  context.config = Object.create(service.config);
  context.service = service;
  context.msg = msg;
  context.cmd = opts.cmd;
  context.nodeId = opts.nodeId;
  context.meta = opts.meta || {};
  context.options = opts;
  return context;
};

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
