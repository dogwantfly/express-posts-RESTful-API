const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title 為必填欄位'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content 為必填欄位'],
      trim: true,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false, timestamps: true }
);
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
