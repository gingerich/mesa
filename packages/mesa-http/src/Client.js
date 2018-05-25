import fetch from 'node-fetch'
import Mesa from '@mesa/core'

export class Client extends Mesa.Component {
  static of (url) {
    return Client.spec({ url })
  }

  compose (compose) {
    const middleware = compose(this.config.subcomponents)
    const { url, ...fetchOpts } = this.config

    return (msg) => {
      const options = {
        ...fetchOpts,
        method: 'POST',
        body: JSON.stringify(msg)
      }

      options.headers = {
        ...options.headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      return fetch(url, options)
        .then(res => res.json())
        .then(middleware)
    }
  }
}

export default Client
