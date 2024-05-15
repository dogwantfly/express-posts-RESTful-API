class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // 捕捉錯誤 stack
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;