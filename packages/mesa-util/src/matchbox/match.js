const keyedPusherFor = obj => (key, value) => {
  obj[key] = obj[key] || []
  obj[key].push(value)
}

const matchFactory = (opts = {}) => (patterns, ordered, strict = false) => {
  let pointers = new Array(patterns.length).fill(0)

  const matchedNodes = {}
  const pushMatchedNode = keyedPusherFor(matchedNodes)

  let maxMatchLength = 0

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
          if (pointers[i] === len) {
            // collect fully matched node
            pushMatchedNode(len, node)
            if (len > maxMatchLength) {
              maxMatchLength = len
            }
          }
        } else {
          pointers[i] = -1 // eliminate pattern
        }
      }
    }
  }

  // let matchNode, capturedInput

  // for (let i = 0; i < pointers.length; i++) {
  //   if (pointers[i] < 0) continue

  //   if (strict && pointers[i] !== ordered.length) continue

  //   if (
  //     pointers[i] >= patterns[i].value.length &&
  //     (!matchNode || patterns[i].value.length > matchNode.value.length)
  //   ) {
  //     matchNode = patterns[i]
  //     capturedInput = patterns[i].value.slice(0, pointers[i])
  //   }
  // }

  // if (strict) {
  //   if (!matchedNodes[ordered.length]) {
  //     return null
  //   }
  //   return
  // }
  if (strict && maxMatchLength !== ordered.length) {
    return null
  }

  const matchedNodesOrderedByMatchLength = []

  for (let i = maxMatchLength; i >= 0; i--) {
    if (matchedNodes[i]) {
      matchedNodesOrderedByMatchLength.push(...matchedNodes[i])
    }
  }

  const maximallyMatchedNode = matchedNodesOrderedByMatchLength[0]

  if (!maximallyMatchedNode) {
    return null
  }

  const capturedInput = maximallyMatchedNode.value.slice(0, maxMatchLength)
  const captured = capturedInput.reduce((result, [key, value]) => {
    result[key] = value
    return result
  }, {})

  return {
    nodes: matchedNodesOrderedByMatchLength,
    maximal: {
      node: maximallyMatchedNode,
      captured
    }
  }

  // if (matchNode) {
  //   // build an object that represents the matched portion of the input
  //   const captured = capturedInput.reduce((result, [key, value]) => {
  //     result[key] = value
  //     return result
  //   }, {})

  //   return {
  //     node: matchNode,
  //     captured
  //   }
  // }
  // return matchNode
}

export const match = matchFactory({ matchValues: (a, b) => a === b })

export default matchFactory
