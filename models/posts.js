const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '使用者 ID 未填寫'],
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
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['group', 'person'],
      required: [true, '貼文類型 type 未填寫'],
    },
    tags: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return v.length > 0;
          },
          message: '貼文標籤 tags 未填寫',
        },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
