class apiError extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statusCode = statuscode || 400;
    this.status = `${statuscode}`.startsWith(5) ? "error" : "fail";
  }
}
module.exports = apiError;
