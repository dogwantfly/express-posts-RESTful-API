
function successHandler(res, data, statusCode = 200) {
  res.status(statusCode).json({ status: true, data });
}

function errorHandler(res, error, statusCode = 400) {
  const message = error instanceof Error ? error.message : error || '欄位填寫錯誤，或無此貼文 id';
  res.status(statusCode).json({ status: false, message });
}

module.exports = {
  successHandler,
  errorHandler,
};
