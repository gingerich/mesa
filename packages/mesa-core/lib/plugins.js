"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.use = use;
exports.action = action;
exports.ns = ns;

function use(component) {
  return service => service.use(component);
}

function action(pattern, handler) {
  return service => service.action(pattern, handler);
}

function ns(namespace, ...actions) {
  if (Array.isArray(actions[0])) {
    actions = actions[0];
  }

  return service => actions.reduce((ns, action) => action(ns), service.ns(namespace));
}