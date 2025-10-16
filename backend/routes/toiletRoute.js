const express = require('express');
const router = express.Router();
const Toilet = require('../models/toilet');
const axios = require('axios');




// 新的路由来获取现有的厕所数据
router.get('/fetch-toilets', async (req, res) => {
  try {
    // 返回数据库中的所有厕所数据
    const toilets = await Toilet.find();
    res.json(toilets);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;

