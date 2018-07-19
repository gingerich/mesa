'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
var _exportNames = {
  extension: true,
  matching: true
}
Object.defineProperty(exports, 'extension', {
  enumerable: true,
  get: function() {
    return _extension.default
  }
})
Object.defineProperty(exports, 'matching', {
  enumerable: true,
  get: function() {
    return _matching.default
  }
})

var _extension = _interopRequireDefault(require('./extension'))

var _matching = _interopRequireDefault(require('./matching'))

var _matchbox = require('./matchbox')

Object.keys(_matchbox).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _matchbox[key]
    }
  })
})

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
