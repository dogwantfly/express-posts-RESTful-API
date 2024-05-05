const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { errorHandler } = require('./utils/responseHandler');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

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
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const statusCode = err.status || 500; // Default to 500 if not provided

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Specific handler for request body syntax errors
    return errorHandler(res, err.message, err.status);
  }
  const errorMessage =
    req.app.get('env') === 'development' ? err.message : 'An error occurred';
  console.error('Error status:', statusCode, 'Error details:', err.message);
  return errorHandler(res, errorMessage, statusCode);
});

module.exports = app;
