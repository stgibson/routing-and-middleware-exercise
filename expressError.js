class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    console.error(this.stack);
  }
}

module.exports = ExpressError;