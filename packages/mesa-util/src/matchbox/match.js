const matchFactory = (opts = {}) => (patterns, ordered, strict = false) => {
  let pointers = new Array(patterns.length).fill(0)
  
  for (const [key, value] of ordered) {

    for (let i = 0; i < patterns.length; i++) {

      // [Optimization]: once patterns[i] is disqualified,
      // we don't want to keep checking it
      if (pointers[i] < 0) continue

      const node = patterns[i]
      const len = node.value.length

      // [Optimazation]: once patterns[i] is fully matched,
      // we don't want to keep checking it
      if (pointers[i] === len) continue
      
      const [k, v] = node.value[pointers[i]]
      
      if (k < key) {
        pointers[i] = -1 // eliminate pattern
      } else if (k === key) {
        // match values
        if (opts.matchValues(v, value, strict)) {
          pointers[i]++
        } else {
          pointers[i] = -1 // eliminate pattern
        }
      }
    }
  }

  let matchNode, capturedInput

  for (let i = 0; i < pointers.length; i++) {
    if (pointers[i] < 0) continue

    if (strict && pointers[i] !== ordered.length) continue
    
    if (pointers[i] >= patterns[i].value.length
      && (!matchNode || patterns[i].value.length > matchNode.value.length)) {
      matchNode = patterns[i]
      capturedInput = patterns[i].value.slice(0, pointers[i])
    }
  }

  if (matchNode) {
    // build an object that represents the matched portion of the input
    const captured = capturedInput.reduce((result, [key, value]) => {
      result[key] = value
      return result
    }, {})
    
    return {
      node: matchNode,
      captured
    }
  }
  return matchNode
}

export const match = matchFactory({ matchValues: (a, b) => a === b })

export default matchFactory
