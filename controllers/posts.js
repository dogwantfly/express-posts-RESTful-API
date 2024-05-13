const mongoose = require('mongoose');
const Post = require('../models/posts');
const User = require('../models/users');

const { successHandler, errorHandler } = require('../utils/responseHandler');

module.exports = {
  getPosts: async (req, res, next) => {
    const posts = await Post.find().populate('user').sort({createdAt: -1});
    successHandler(res, posts);
  },

  createPost: async (req, res, next) => {
    try {
      const { content, user, type, tags, image } = req.body;
      console.log(req.body.user);
      if (!mongoose.isValidObjectId(user)) {
        return errorHandler(res, '使用者 id 不符合格式或不存在');
      }
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return errorHandler(res, '使用者 id 不存在');
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
        errorHandler(res, '缺少必要的貼文內容');
      }
    } catch (error) {
      errorHandler(res, error);
    }
  },

  deletePosts: async (req, res, next) => {
    if (req.originalUrl === '/posts/') {
      return errorHandler(res, '請輸入貼文 id');
    }
    const result = await Post.deleteMany();
    successHandler(res, result);
  },

  deletePostById: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return errorHandler(res, '貼文 id 不符合格式或不存在');
      }
      const result = await Post.findByIdAndDelete(id);

      if (result !== null) {
        successHandler(res, result);
      } else {
        return errorHandler(res);
      }
    } catch (error) {
      errorHandler(res, error);
    }
  },

  updatePostById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return errorHandler(res, '貼文 id 不符合格式或不存在');
      }
      if (!content) {
        return errorHandler(res, '貼文內容不得為空');
      }
      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return errorHandler(res, '貼文 id 不存在');
      }
      const editContent = { content };
      const result = await Post.findByIdAndUpdate(id, editContent, {
        new: true,
        runValidators: true,
      });
      if (!result) {
        return errorHandler(res, '更新錯誤');
      }
      successHandler(res, result);
    } catch (error) {
      errorHandler(res, error);
    }
  },
};
