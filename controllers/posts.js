const mongoose = require('mongoose');
const Post = require('../models/posts');
const { successHandler, errorHandler } = require('../utils/responseHandler');

module.exports = {
  getPosts: async (req, res, next) => {
    const posts = await Post.find();
    successHandler(res, posts);
  },

  createPost: async (req, res, next) => {
    try {
      const { title, content } = req.body;
      if (content !== undefined && title !== undefined) {
        const newPost = {
          title,
          content,
        };
          const result = await Post.create(newPost);
          successHandler(res, result, 201);
        } else {
          errorHandler(res);
        }
      } catch (error) {
        errorHandler(res, error);
      }
  },

  deletePosts: async (req, res, next) => { 
      if (req.originalUrl === "/posts/") {
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