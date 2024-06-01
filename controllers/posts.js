const mongoose = require('mongoose');
const Post = require('../models/posts');
const User = require('../models/users');
const appError = require('../statusHandle/appError');
const { successHandler } = require('../utils/responseHandler');

module.exports = {
  getPosts: async (req, res, next) => {
    const { sortBy = 'createdAt', order = 'desc', content } = req.query;

    let query = {};
    if (content) {
      query.content = { $regex: content, $options: 'i' }; // 不區分大小寫的部分匹配
    }

    const posts = await Post.find(query)
      .populate('user')
      .populate({
        path: 'comments.user',
        select: 'name avatar',
      })
      .populate('likes', 'name')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });
    successHandler(res, posts);
  },

  getPostById: async (req, res, next) => {
    const postId = req.params.postId;

    if (!mongoose.isValidObjectId(postId)) {
      next(new appError(400, '貼文 id 不符合格式或不存在'));
    }

    const post = await Post.findById(postId)
      .populate('user')
      .populate({
        path: 'comments.user',
        select: 'name avatar',
      })
      .populate('likes', 'name');
    if (!post) {
      return next(new AppError(404, '找不到該貼文'));
    }
    successHandler(res, post);
  },

  createPost: async (req, res, next) => {
    const { content, user, type, tags, image } = req.body;

    if (!mongoose.isValidObjectId(user)) {
      next(new appError(400, '使用者 id 不符合格式或不存在'));
    }
    const existingUser = await User.findById(user);
    if (!existingUser) {
      next(new appError(400, '使用者 id 不存在'));
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
      next(new appError(400, '缺少必要的貼文內容'));
    }
  },

  deletePosts: async (req, res, next) => {
    if (req.originalUrl === '/posts/') {
      next(new appError(400, '請輸入貼文 id'));
    }
    const result = await Post.deleteMany();
    successHandler(res, result);
  },

  deletePostById: async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      next(new appError(400, '貼文 id 不符合格式或不存在'));
    }
    const result = await Post.findByIdAndDelete(id);

    if (result !== null) {
      successHandler(res, result);
    } else {
      next(new appError(400, '刪除失敗，此貼文不存在'));
    }
  },

  updatePostById: async (req, res, next) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      next(new appError(400, '貼文 id 不符合格式或不存在'));
    }
    if (!content) {
      next(new appError(400, '貼文內容不得為空'));
    }
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      next(new appError(400, '貼文 id 不存在'));
    }
    const editContent = { content };
    const result = await Post.findByIdAndUpdate(id, editContent, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      next(new appError(400, '更新錯誤'));
    }
    successHandler(res, result);
  },

  likePost: async (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(postId)) {
      next(new appError(400, '貼文 id 不符合格式或不存在'));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(new appError(404, '找不到該貼文'));
    }

    if (post?.likes.some((like) => like.toString() === userId)) {
      return next(new appError(400, '已經點過讚了'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true, runValidators: true } // 確保返回更新後的文檔並執行模型驗證
    ).populate('likes', 'name avatar');

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likes: postId } },
      { new: true, runValidators: true }
    );

    successHandler(res, {
      likes: updatedPost.likes,
    });
  },
  unlikePost: async (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    if (!mongoose.isValidObjectId(postId)) {
      next(new appError(400, '貼文 id 不符合格式或不存在'));
    }

    const post = await Post.findById(postId);

    if (!post) {
      return next(new appError(404, '找不到該貼文'));
    }

    if (!post.likes.some((like) => like.toString() === userId)) {
      return next(new appError(400, '您尚未點過讚'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true, runValidators: true }
    ).populate('likes', 'name avatar');

    await User.findByIdAndUpdate(
      userId,
      { $pull: { likes: postId } },
      { new: true, runValidators: true }
    );

    successHandler(res, { likes: updatedPost.likes });
  },
  addComment: async (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { comment } = req.body;

    if (!mongoose.isValidObjectId(postId)) {
      next(new appError(400, '貼文 id 不符合格式或不存在'));
    }

    if (!comment) {
      return next(new appError(400, '留言內容不能為空'));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(new appError(404, '找不到該貼文'));
    }

    const newComment = {
      user: userId,
      text: comment,
    };
    post.comments.push(newComment);
    await post.save();
    const populatedPost = await Post.findById(post._id).populate({
      path: 'comments.user',
      select: 'name avatar',
    });
    successHandler(
      res,
      {
        post: populatedPost,
      },
      201
    );
  },
  getUserPosts: async (req, res, next) => {
    const userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId)) {
      next(new appError(400, '用戶 id 不符合格式或不存在'));
    }

    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    const user = await User.findById(userId);
    if (!user) {
      return next(new appError(404, '找不到此用戶'));
    }
    if (!posts.length) {
      return next(new appError(404, '找不到此用戶的貼文'));
    }
    successHandler(res, {
      posts,
      user,
    });
  },
};
