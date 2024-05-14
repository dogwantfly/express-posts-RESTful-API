const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

require('./connection');
const appError = require("./statusHandle/appError"); 
const { resErrorProd, resErrorDev } = require('./utils/responseHandler');

process.on('uncaughtException', err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
    console.error('Uncaughted Exception！')
    console.error(err);
    process.exit(1);
});

const postsRouter = require('./routes/posts');
const uploadImageRouter = require('./routes/uploadImage');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/posts', postsRouter);
app.use('/api/v1/uploadImage', uploadImageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(appError(404, "無此頁面資訊，請重新回到首頁"))
});

// error handler
app.use(function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  // 開發環境
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }
  // 正式環境
  if(err.isAxiosError == true){
    err.message = "axios 連線錯誤";
    err.isOperational = true;
    return resErrorProd(err, res)
  } else if (err.name === 'ValidationError'){
    // mongoose 資料辨識錯誤
    err.message = "資料欄位未填寫正確，請重新輸入！";
    err.isOperational = true;
    return resErrorProd(err, res)
  }
  resErrorProd(err, res)
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
  // 記錄於 log 上
});

module.exports = app;
