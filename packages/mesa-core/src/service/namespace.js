import memoize from 'fast-memoize';
import { matchbox } from '@mesa/util';
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

  action(pattern, component, options) {
    if (typeof pattern === 'string') {
      pattern = { act: pattern };
    }

    // if (typeof component === 'object') {
    // }

    defineHandler(this.registry, pattern, component, options);

    return this;
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

  router(options = this.options.router) {
    const match = memoize(msg => this.match(msg));
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
