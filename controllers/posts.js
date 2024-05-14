const mongoose = require('mongoose');
const Post = require('../models/posts');
const User = require('../models/users');
const appError = require("../statusHandle/appError"); 
const { successHandler } = require('../utils/responseHandler');

module.exports = {
  getPosts: async (req, res, next) => {
    const { sortBy = 'createdAt', order = 'desc', content } = req.query;

    let query = {};
    if (content) {
      query.content = { $regex: content, $options: 'i' }; // 不區分大小寫的部分匹配
    }

    const posts = await Post.find(query).populate('user').sort({ [sortBy]: order === 'desc' ? -1 : 1 });
    successHandler(res, posts);
  },

  createPost: async (req, res, next) => {
    const { content, user, type, tags, image } = req.body;

    if (!mongoose.isValidObjectId(user)) {
      next(appError(400, "使用者 id 不符合格式或不存在"))
    }
    const existingUser = await User.findById(user);
    if (!existingUser) {
      next(appError(400, "使用者 id 不存在"))
    }
    if (content !== undefined) {
      const newPost = {
        content,
        user,
        type,
        tags,
        image,
      };
      const result = await Post.create(newPost);
      successHandler(res, result, 201);
    } else {
      next(appError(400, "缺少必要的貼文內容"))
    }
  },

  deletePosts: async (req, res, next) => {
    if (req.originalUrl === '/posts/') {
      next(appError(400, "請輸入貼文 id"))
    }
    const result = await Post.deleteMany();
    successHandler(res, result);
  },

  deletePostById: async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      next(appError(400, "貼文 id 不符合格式或不存在"))
    }
    const result = await Post.findByIdAndDelete(id);

    if (result !== null) {
      successHandler(res, result);
    } else {
      next(appError(400, "刪除失敗"))
    }
  },

  updatePostById: async (req, res, next) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      next(appError(400, "貼文 id 不符合格式或不存在"))
    }
    if (!content) {
      next(appError(400, "貼文內容不得為空"))
    }
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      next(appError(400, "貼文 id 不存在"))
    }
    const editContent = { content };
    const result = await Post.findByIdAndUpdate(id, editContent, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      next(appError(400, '更新錯誤'))
    }
    successHandler(res, result);
  },
};
