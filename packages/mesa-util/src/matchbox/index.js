import matchFactory from './match'

function getOrderedEntries (obj) {
  return Object.keys(obj).sort().reduce((entries, key) => {
    entries.push([key, obj[key]])
    return entries
  }, [])
}

class Node {
  constructor (value) {
    this.value = value
  }
}

class Matchbox {
  constructor (options) {
    this.options = options
    this.nodes = new Map()
  }

  define (pattern) {
    const ordered = getOrderedEntries({ ...pattern })
    // const key = ordered.join('')
    const key = JSON.stringify(ordered)
    
    if (!this.nodes.has(key)) {
      const node = new Node(ordered, pattern)
      this.nodes.set(key, node)
    }
    
    return this.nodes.get(key)
  }

  get (pattern) {
    const ordered = getOrderedEntries(pattern)
    const key = ordered.join('')

    return this.nodes.get(key)
  }

  remove (pattern) {
    const ordered = getOrderedEntries(pattern)
    const key = ordered.join('')

    return this.nodes.delete(key)
  }

  match (input, strict) {
    const ordered = getOrderedEntries({ ...input })
    const patterns = [...this.nodes.values()]

    if (!patterns.length) {
      return
    }

    const node = this.options.match(patterns, ordered, strict)
    return node

    if (node) {
      return { node }
    }
  }
}

export function matchbox (opts = {}) {
  const match = matchFactory({
    matchValues (patternVal, inputVal, strict) {
      if (typeof patternVal === 'function') {
        return patternVal(inputVal)
      }

      if (typeof patternVal === 'string' && patternVal.endsWith('*')) {
        return inputVal.startsWith(patternVal.slice(0, -1))
      }

      if (patternVal instanceof RegExp) {
        return patternVal.test(inputVal)
      }

      if (typeof patternVal === 'object' && opts.nested) {
        const patterns = [new Node(getOrderedEntries(patternVal))]
        return !!match(patterns, getOrderedEntries({ ...inputVal }), strict)
      }

      return patternVal === inputVal
    }
  })

  return new Matchbox({ ...opts, match })
}
