class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      this.stack = stack || Error.captureStackTrace(this, this.constructor);
      this.success = false;
    }
  }
  
  export default ApiError;
  