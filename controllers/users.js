const User = require('../models/users');
const appError = require('../statusHandle/appError');
const { successHandler } = require('../utils/responseHandler');
const {
  validatePassword,
  isSexInEnum,
  validSexValues,
} = require('../utils/users');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { generateSendJWT } = require('../statusHandle/auth');

module.exports = {
  signUp: async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;
    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(new appError(400, '欄位未填寫正確！'));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(new appError(400, '密碼不一致！'));
    }
    validatePassword(password);
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(new appError(400, 'Email 格式不正確'));
    }

    // 加密密碼
    password = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password,
      name,
    });
    generateSendJWT(newUser, 201, res);
  },
  signIn: async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new appError(400, '帳號密碼不可為空'));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new appError(400, '帳號或密碼不正確'));
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(new appError(400, '帳號或密碼不正確'));
    }
    generateSendJWT(user, 200, res);
  },
  updatePassword: async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(new appError(400, '密碼不一致！'));
    }
    validatePassword(password);

    const newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        password: newPassword,
      },
      { new: true, runValidators: true }
    );
    generateSendJWT(user, 200, res);
  },
  getProfile: async (req, res, next) => {
    successHandler(res, req.user);
  },
  updateProfile: async (req, res, next) => {
    const { name, sex } = req.body;
    if (!name) {
      return next(new appError(400, '暱稱不可為空'));
    }
    if (!validator.isLength(name.trim(), { min: 2 })) {
      return next(new appError(400, '暱稱至少 2 個字元以上'));
    }
    if (!sex) {
      return next(new appError(400, '性別不可為空'));
    }
    if (!isSexInEnum(sex, validSexValues)) {
      return next(new appError(400, '性別填寫錯誤'));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        sex,
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return next(new appError(400, '更新失敗！'));
    }

    successHandler(res, user);
  },
};
