import EventEmitter from 'eventemitter3';
import { compose } from '@mesa/component';
import * as Context from './context';
import { Message } from './message';
import { Hooks } from './hook';
import { ActionNotFoundError } from './errors';
import { Config } from '../components';
import { Stack } from '../components/common';

const defaultHandler = () => ActionNotFoundError.reject();

export class Service {
  constructor(namespace, schema) {
    this.namespace = namespace;
    this.schema = schema;
    this.name = schema.name;
    this.config = schema.config;
    this.hooks = new Hooks();
    this.events = new EventEmitter(this.name);
    // this.context = Context.extend(schema.context)
  }

  /*
   * Extendability methods
   */

  use(ns, component) {
    this.namespace.use(ns, component);
    return this;
  }

  stack(...middleware) {
    const stack = Stack.spec().use(...middleware);
    this.use(stack);
    return stack;
  }

  plugin(plug, cb) {
    const result = plug(this);
    if (cb) {
      cb(result);
    }
    return this;
  }

  // registerHook(name, component) {
  //   this.hooks.register(name, componentn)
  //   const { [name]: hook = [] } = this.hooks
  //   hook.push(component)
  // }

  // getHook(name) {
  //   const { [name]: hook = [] } = this.hooks
  //   return compose(hook)
  // }

  /*
   * Service methods
   */

  ns(namespace, options) {
    return this.namespace.ns(namespace, options);
  }

  action(pattern, component, options) {
    this.namespace.action(pattern, component, options);
    return this;
  }

  handle(ctx, next) {
    if (!this._handler) {
      this._handler = this.compose();
    }
    return this._handler(ctx, next);
  }

  call(action, msg, opts) {
    const parts = [action];

    if (typeof action === 'object' && opts === undefined) {
      opts = msg;
      msg = null;
    }

    if (msg !== null) {
      parts.push(msg);
    }

    const message = Message.from(...parts);

    const ctx = this.createContext(message, opts);

    return this.handle(ctx, defaultHandler); // defaultHandler could be optional param in opts
  }

  emit(...args) {
    const message = Message.from(...args);

    const ctx = this.createContext(message, { cmd: 'event' });

    return this.handle(ctx);
  }

  /*
   * Utility methods
   */

  createContext(message, opts = {}) {
    if (opts.ctx) {
      const ctx = opts.ctx;
      ctx.msg = message.body;
      return ctx;
    }

    return Context.create(this, message.body, this.schema.context, opts);
    // return this.context.create(this, msg)
  }

  toComponent() {
    return Config.spec(this.config).use(this.namespace.router());
  }

  compose() {
    return compose(this.toComponent(), this);
  }

  onActionAdded(listener) {
    this.events.on('action:add', listener);
  }

  onActionRemoved(listener) {
    this.events.on('action:remove', listener);
  }
}
