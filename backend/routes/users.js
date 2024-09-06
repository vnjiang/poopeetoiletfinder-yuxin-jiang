const express = require('express');
const router = express.Router();
const User = require('../models/user');

// 创建新的用户
router.post('/', async (req, res) => {
  try {
    const { username, email, password, uid } = req.body;

    // 检查所有字段是否填写
    if (!username || !email || !password || !uid) {
      return res.status(400).send('All fields are required.');
    }

    // 检查用户名是否已经存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists. Please choose another.');
    }

    // 创建新用户并保存 Firebase UID
    const user = new User({ username, email, password, uid });
    await user.save();

    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// 获取特定用户信息
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});



module.exports = router;

