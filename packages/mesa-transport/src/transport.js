export class Transport {
  constructor(connection, options = {}) {
    this.connection = connection
    this.options = options
  }

  ingress(/* service */) {
    // noop
  }

  egress(/* service */) {
    // noop
  }
}
