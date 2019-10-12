export class MesaError extends Error {
  static async reject(...args) {
    const error = new this(...args)
    throw error
  }

  constructor(message, code = 500, data = null) {
    super(message)
    this.code = code
    this.data = data
    this.retryable = false
    this.type = this.constructor.type
  }
}

export class MesaRetryableError extends MesaError {
  constructor(message, code, data) {
    super(message, code, data)
    this.retryable = true
  }
}

export class UnhandledMessageError extends MesaRetryableError {
  constructor(data) {
    const message = `No handler for message`
    super(message)
  }
}

module.exports = {
  MesaError,
  MesaRetryableError,

  UnhandledMessageError
}
