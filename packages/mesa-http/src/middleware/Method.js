import Mesa, { Match } from '@mesa/core'
import methods from 'methods'

export class Method extends Mesa.Component {
  static matches (method, matchMethod) {
    if (!matchMethod) return true
    matchMethod = matchMethod.toUpperCase()
    if (method === matchMethod) return true
    if (matchMethod === 'GET' && method === 'HEAD') return true
    return false
  }

  match (method) {
    return Method.matches(method, this.config.method)
  }

  compose () {
    return Match.accept({ method: method => this.match(method) })
      .use(this.config.subcomponents)
  }
}

methods.forEach((method) => {
  Method[method] = function (config) {
    return Method.spec({ ...config, method })
  }
})

export { methods }

export default Method
