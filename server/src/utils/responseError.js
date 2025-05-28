class ResponseError extends Error {
  constructor(message, code, errors = null) {
    super(message);
    this.code = code;
    this.errors = errors;
  }
}

export default ResponseError;