const AppError = require('../statusHandle/appError');
const { resErrorProd, resErrorDev } = require('../utils/responseHandler');

const handleValidationError = (err) => {
  const message = err || '資料欄位不符合正確格式，請重新輸入！';
  return new AppError(400, message);
};

const handleAxiosError = (err) => {
  const message = `外部 API 連線錯誤，請稍後再試`;
  return new AppError(503, message);
};

const handleTokenError = (err) => {
  const message =
    err.name === 'TokenExpiredError'
      ? 'token 已過期'
      : err.name === 'JsonWebTokenError'
      ? 'token 無效'
      : 'token 驗證失敗';
  return new AppError(401, message);
};

const errorHandlers = {
  ValidationError: handleValidationError,
  TokenExpiredError: handleTokenError,
  JsonWebTokenError: handleTokenError,
  AxiosError: handleAxiosError,
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 查找錯誤處理函數
  const handler = errorHandlers[err.name] || errorHandlers[err.type];

  if (handler) {
    err = handler(err);
  }

  if (process.env.NODE_ENV === 'dev') {
    resErrorDev(err, req, res);
  } else {
    resErrorProd(err, res);
  }
};

module.exports = errorHandler;
