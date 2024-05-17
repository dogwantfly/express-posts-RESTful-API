const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('./connection');
const appError = require("./statusHandle/appError"); 
const errorHandler = require('./middlewares/errorHandler');
const postsRouter = require('./routes/posts');
const uploadImageRouter = require('./routes/uploadImage');
const usersRouter = require('./routes/users');

process.on('uncaughtException', err => {
    console.error('Uncaughted Exception！')
    console.error(err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
});


const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/posts', postsRouter);
app.use('/api/v1/uploadImage', uploadImageRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(new appError(404, "無此頁面資訊，請重新回到首頁"))
});

// error handler
app.use(errorHandler);

module.exports = app;
