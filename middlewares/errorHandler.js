const AppError = require('../statusHandle/appError');
const { resErrorProd, resErrorDev } = require('../utils/responseHandler');

const handleValidationError = (err) => {
  const message = '資料欄位未填寫正確，請重新輸入！';
  return new AppError(400, message);
};

const handleAxiosError = (err) => {
  const message = '外部 API 連線錯誤';
  return new AppError(503, message);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'ValidationError') {
    err = handleValidationError(err);
  }
  if (err.isAxiosError) {
    err = handleAxiosError(err);
  }
  
  if (process.env.NODE_ENV === 'dev') {
    resErrorDev(err, req, res);
  } else {
    resErrorProd(err, res);
  }
};

module.exports = errorHandler;