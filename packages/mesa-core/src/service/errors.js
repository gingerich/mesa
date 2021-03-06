export class MesaError extends Error {
  static async reject(...args) {
    const error = new this(...args);
    throw error;
  }

  constructor(message, code, data) {
    super(message);
    this.code = code || 500;
    this.data = data;
    this.retryable = false;
    this.type = this.constructor.type;
  }
}

export class MesaRetryableError extends MesaError {
  constructor(message, code, data) {
    super(message, code, data);
    this.retryable = true;
  }
}

export class ActionNotFoundError extends MesaRetryableError {
  constructor(data) {
    const message = `No handler found for message`;
    super(message, 500, data);
  }
}

export class ProtocolVersionMismatchError extends MesaError {
  static get type() {
    return 'PROTOCOL_VERSION_MISMATCH';
  }

  constructor(data) {
    super(`Mismatching protocol version`, 500, data);
  }
}

module.exports = {
  MesaError,
  MesaRetryableError,

  ActionNotFoundError,
  ProtocolVersionMismatchError
};
