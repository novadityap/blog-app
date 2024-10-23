class ResponseError extends Error {
  constructor(message, code, errors = null, data = null) {
    super(message);
    this.code = code;
    this.errors = errors;
    this.data = data;
  }
}

export default ResponseError;