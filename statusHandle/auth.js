const jwt = require('jsonwebtoken');
const appError = require('../statusHandle/appError');
const handleErrorAsync = require('../statusHandle/handleErrorAsync');
const User = require('../models/users');
const { successHandler } = require('../utils/responseHandler');

const generateSendJWT = (user, statusCode, res) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  const userForResponse = {
    token,
    name: user.name,
    email: user.email,
  };
  successHandler(res, userForResponse);
};

const isAuth = handleErrorAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new appError(401, '你尚未登入！'));
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new appError(401, '找不到對應的用戶'));
  }
  req.user = currentUser;
  next();
});

module.exports = {
  isAuth,
  generateSendJWT,
};
