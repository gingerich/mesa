export class BaseTransport {
  constructor(transit, options = {}) {
    this.transit = transit
    this.options = options
  }

  ingress(/* service */) {
    // noop
  }

  egress(/* service */) {
    // noop
  }

  getMessageHandler(service, callback) {
    return (data, type) => service.call({ data, type })
  }
}
