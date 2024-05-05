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
      default: 'https://via.placeholder.com/150',
    },
  },
  { versionKey: false, timestamps: true }
);
const User = mongoose.model('User', userSchema);

module.exports = User;
