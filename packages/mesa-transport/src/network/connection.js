export default class Connection {
  static resolve(connection, options = {}) {
    if (typeof connection === 'object') {
      return connection;
    }

    if (typeof options === 'number') {
      options = { port: options };
    }

    if (typeof connection === 'string') {
      try {
        const url = Connection.Url(connection);
        return { ...url, ...options };
      } catch (e) {
        return { scheme: connection, ...options };
      }
    }
  }
}

Connection.Url = function Url(connectionString) {
  const url = new URL(connectionString);
  return {
    protocol: url.protocol,
    username: url.username,
    password: url.password,
    hostname: url.hostname,
    host: url.host,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    searchParams: url.searchParams,
    hash: url.hash,
    origin: url.origin,
    href: url.href,
    scheme: url.protocol.slice(0, -1), // trim trailing ':'
    // url,
    get url() {
      return new URL(this.href);
    }
  };
};
