function successHandler(res, data, statusCode = 200) {
  if (res.headersSent) return;
  res.status(statusCode).json({ status: true, data });
}

const resErrorProd = (err, res) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : '系統錯誤，請恰系統管理員';
  console.error('錯誤：', err);

  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};

const resErrorDev = (err, req, res) => {
  const errorTimestamp = new Date().toISOString();
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message,
    error: err,
    stack: err.stack,
    time: errorTimestamp,
    method: req.method,
    path: req.originalUrl,
    query: req.query,
    body: req.body,
  });
};

module.exports = {
  successHandler,
  resErrorProd,
  resErrorDev,
};
