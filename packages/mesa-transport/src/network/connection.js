export default class Connection {
  static resolve(connection, options = {}) {
    if (typeof connection === 'object') {
      return connection
    }

    if (typeof options === 'number') {
      options = { port: options }
    }

    if (typeof connection === 'string') {
      try {
        const url = new URL(connection)
        return {
          protocol: url.protocol,
          username: url.username,
          password: url.password,
          host: url.host,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          search: url.search,
          searchParams: url.searchParams,
          hash: url.hash,
          origin: url.origin,
          href: url.href,
          ...options
        }
      } catch (e) {
        return { protocol: connection, ...options }
      }
    }
  }
}
