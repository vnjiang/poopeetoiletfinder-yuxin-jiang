const mongoose = require('mongoose');

// 定义 User Schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true, 
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
  }
});

// 密码加密
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const bcrypt = require('bcrypt');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 密码比对
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 创建模型
const User = mongoose.model('User', userSchema, 'users'); // 'users' 是集合的名称

module.exports = User;
