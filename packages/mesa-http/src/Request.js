import fetch from 'node-fetch'
import Mesa from '@mesa/core'

export class Request extends Mesa.Component {
  compose(compose) {
    const middleware = compose(this.config.subcomponents)
    const { url, ...options } = this.config

    return (msg, next) =>
      fetch(url, options)
        .then(res => res.json())
        .then(middleware)
  }
}

;['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].forEach(
  method => {
    Request[method] = function(config) {
      return Request.spec({ ...config, method: method.toUpperCase() })
    }
  }
)

export default Request
