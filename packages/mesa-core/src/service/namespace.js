import memoize from 'fast-memoize';
import { matchbox, uuid } from '@mesa/util';
import { Service } from './service';
import { Stack } from '../components/common';
import { Container, Actions, Router } from '../components';

const defaultOptions = {
  router: {
    destructure: 'body'
  }
};

export class Namespace {
  constructor(options) {
    this.options = { ...defaultOptions, ...options };
    this.registry = matchbox(options.match);
    this.container = Container.spec();
    this.cacheId = uuid();
  }

  use(ns, component) {
    if (typeof component === 'undefined') {
      component = ns;
      if (component instanceof Service) {
        component = component.toComponent();
      }
      this.container.use(component);
      return this;
    }

    this.ns(ns).use(component);
    return this;
  }

  register(pattern, component, options) {
    if (typeof pattern === 'string') {
      pattern = { act: pattern };
    }

    // if (typeof component === 'object') {
    // }

    defineHandler(this.registry, pattern, component, options);

    return this;
  }

  unregister(pattern, component) {
    if (!component) {
      this.registry.remove(pattern);
      return;
    }
    // remove specific component
    throw new Error('TODO');
  }

  has(pattern) {
    return this.registry.has(pattern);
  }

  ns(pattern, options = {}) {
    if (typeof pattern === 'string') {
      pattern = pattern.split('.').map(ns => ({ ns }));
    }

    if (Array.isArray(pattern)) {
      return pattern.reduce((result, ns) => result.ns(ns, options), this);
    }

    const ns = new Namespace(options);

    defineHandler(this.registry, pattern, ns.router());

    return ns;
  }

  match(pattern, strict) {
    return this.registry.match(pattern, strict);
  }

  flushCache() {
    this.cacheId = uuid();
  }

  router(options = this.options.router) {
    const memMatch = memoize(
      // including second argument tells memoize to treat as multi-argument function (fn.length > 1)
      (msg, cacheId) => this.match(msg)
    );

    const match = msg => memMatch(msg, this.cacheId);

    const config = { match, ...options };

    return Stack.spec()
      .use(this.container)
      .use(Router.spec(config));
  }
}

function defineHandler(registry, pattern, component, options) {
  const node = registry.define(pattern);

  if (!node.handlers) {
    node.handlers = [];
  }

  const handler = Actions.Handler.spec(options).use(component);

  node.handlers.push(handler);

  return node;
}
