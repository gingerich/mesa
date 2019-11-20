// function matcher (value, pattern) {
//   if (typeof pattern === 'function') {
//     return pattern(value)
//   }
//   if (pattern instanceof RegExp) {
//     return pattern.test(value)
//   }

//   return value == pattern
// }

// function matching (matches) {
//   // return ctx =>
//   //   matches.some(match =>
//   //     Object.keys(match).every(key => matcher(ctx[key], match[key])))

//   return ctx =>
//     Promise.all(
//       matches.map(match =>
//         Promise.all(
//           typeof match === 'function'
//             ? match(ctx)
//             : Object.keys(match).map(key => matcher(ctx[key], match[key]))
//         )
//         .then(results => results.every(r => r))
//       )
//     )
//     .then(results => results.some(r => r))
// }

const defaultMatcher = (pattern, value) => {
  if (typeof pattern === 'function') {
    return pattern(value);
  }
  if (pattern instanceof RegExp) {
    return pattern.test(value);
  }

  return value == pattern;
};

const matchEvery = matchResults => matchResults.every(isMatching => isMatching);

const matchAny = matchResults => matchResults.some(isMatching => isMatching);

function matching(matches = [], options = {}) {
  // return data =>
  //   matches.some(match =>
  //     Object.keys(match).every(key => matcher(data[key], match[key])))

  const { matcher = defaultMatcher } = options;

  return data => {
    const evaluateToArray = match =>
      typeof match === 'function'
        ? [match(data)]
        : Object.keys(match).map(key => matcher(match[key], data[key]));

    const matchObject = match => Promise.all(evaluateToArray(match)).then(matchEvery);

    return Promise.all(matches.map(matchObject)).then(matchAny);
  };
}

module.exports = matching;
module.exports.matcher = defaultMatcher;
