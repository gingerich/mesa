export class MesaError extends Error {
  static async reject(...args) {
    const error = new this(...args)
    throw error
  }

  constructor(message, code, type, data) {
    super(message)
    this.code = code || 500
    this.type = type
    this.data = data
    this.retryable = false
  }
}

export class MesaRetryableError extends MesaError {
  constructor(message, code, type, data) {
    super(message, code, type, data)
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
