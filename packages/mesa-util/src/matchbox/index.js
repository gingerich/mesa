import matchFactory from './match';

const compareFn = (a, b) => a[0] > b[0];

function getOrderedEntries(obj) {
  return Object.entries(obj).sort(compareFn);
}

class Node {
  constructor(value) {
    this.value = value;
  }
}

class Matchbox {
  constructor(options) {
    this.options = options;
    this.nodes = new Map();
  }

  define(pattern) {
    const obj = { ...pattern };
    const ordered = getOrderedEntries(obj);
    const key = JSON.stringify(pattern);

    if (!this.nodes.has(key)) {
      const node = new Node(ordered, pattern);
      this.nodes.set(key, node);
    }

    return this.nodes.get(key);
  }

  get(pattern) {
    const key = JSON.stringify(pattern);
    return this.nodes.get(key);
  }

  remove(pattern) {
    const key = JSON.stringify(pattern);
    return this.nodes.delete(key);
  }

  match(input, strict) {
    // const exactNode = this.get(input)
    // if (exactNode) {
    //   return {
    //     nodes: [exactNode],
    //     maximal: { node: exactNode, captured: exactNode }
    //   }
    // }

    const ordered = getOrderedEntries({ ...input });
    const patterns = [...this.nodes.values()];

    if (!patterns.length) {
      return null;
    }

    const matched = this.options.match(patterns, ordered, strict);
    return matched;

    if (node) {
      return { node };
    }
  }
}

export function matchbox(opts = {}) {
  const match = matchFactory({
    matchValues(patternVal, inputVal, strict) {
      if (typeof patternVal === 'function') {
        return patternVal(inputVal);
      }

      if (typeof patternVal === 'string' && patternVal.endsWith('*')) {
        return inputVal.startsWith(patternVal.slice(0, -1));
      }

      if (patternVal instanceof RegExp) {
        return patternVal.test(inputVal);
      }

      if (typeof patternVal === 'object' && opts.nested) {
        const patterns = [new Node(getOrderedEntries(patternVal))];
        return !!match(patterns, getOrderedEntries({ ...inputVal }), strict);
      }

      return patternVal === inputVal;
    }
  });

  return new Matchbox({ ...opts, match });
}
