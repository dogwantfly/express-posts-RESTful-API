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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new appError(400, '帳號已存在'));
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
    if (!validator.isLength(name.trim(), { min: 2 })) {
      return next(new appError(400, '暱稱至少 2 個字元以上'));
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
    const { name, sex, avatar } = req.body;
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
    if (avatar && !validator.isURL(avatar, { protocols: ['https'] })) {
      return next(new appError(400, 'avatar 必須是 https URL'));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        sex,
        avatar,
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return next(new appError(400, '更新失敗！'));
    }

    successHandler(res, user);
  },
  followUser: async (req, res, next) => {
    const targetUserId = req.params.userId;
    const userId = req.user.id;
    if (userId === targetUserId) {
      return next(new appError(400, '不能追蹤自己'));
    }
    const targetUser = await User.findById(targetUserId);
    const user = await User.findById(userId);
    if (!targetUser) {
      return next(new appError(404, '找不到該用戶'));
    }

    const hasFollowed =
      targetUser.followers.some(
        (follower) => follower.user?.toString() === userId
      ) ||
      user.following.some(
        (following) => following.user?.toString() === targetUserId
      );

    if (hasFollowed) {
      return next(new appError(400, '已追蹤此用戶'));
    }
    await User.updateOne(
      {
        _id: userId,
        'following.user': { $ne: targetUserId },
      },
      {
        $addToSet: { following: { user: targetUserId } },
      }
    );

    await User.updateOne(
      {
        _id: targetUserId,
        'followers.user': { $ne: userId },
      },
      {
        $addToSet: { followers: { user: userId } },
      }
    );

    successHandler(res, { message: '成功追蹤用戶' });
  },
  unfollowUser: async (req, res, next) => {
    const targetUserId = req.params.userId;
    const userId = req.user.id;

    if (userId === targetUserId) {
      return next(new appError(400, '不能取消追蹤自己'));
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return next(new appError(404, '找不到該用戶'));
    }

    const user = await User.findById(userId);
    const notFollowing =
      !user.following.some((f) => f.user?.toString() === targetUserId) &&
      !targetUser.followers.some((f) => f.user?.toString() === userId);
    if (notFollowing) {
      return next(new appError(404, '未追蹤此用戶，無法取消追蹤'));
    }

    await User.updateOne(
      { _id: userId },
      { $pull: { following: { user: targetUserId } } }
    );
    await User.updateOne(
      { _id: targetUserId },
      { $pull: { followers: { user: userId } } }
    );

    successHandler(res, { message: '成功取消追蹤用戶' });
  },
  getLikeList: async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'likes',
      model: 'Post',
    });

    if (!user) {
      return next(new appError(400, '用戶不存在'));
    }
    successHandler(res, {
      likes: user.likes,
    });
  },
  getFollowingList: async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'following.user',
      model: 'User',
      select: 'name avatar',
    });

    if (!user) {
      return next(new appError(404, '用戶不存在'));
    }
    successHandler(res, {
      following: user.following,
    });
  },
};
