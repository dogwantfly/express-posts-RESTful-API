const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name 為必填欄位'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email 為必填欄位'],
      trim: true,
      unique: true,
      validate: {
        validator: function (email) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: (props) => `${props.value} 不是一個有效的郵件地址!`,
      },
    },
    avatar: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/metawall-social-media.appspot.com/o/images%2Fuser_default%402x.png?alt=media&token=91fce5a4-14a1-40e5-bfb6-4c6b2a69e0af',
    },
    sex: {
      type: String,
      enum: ['male', 'female'],
    },
    password: {
      type: String,
      required: [true, '請輸入密碼'],
      minlength: 8,
      select: false,
    },
    followers: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    following: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
      },
    ],
  },
  { versionKey: false, timestamps: true }
);
const User = mongoose.model('User', userSchema);

module.exports = User;
