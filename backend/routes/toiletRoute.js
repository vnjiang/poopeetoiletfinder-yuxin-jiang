const express = require('express');
const router = express.Router();
const Toilet = require('../models/toilet');
const axios = require('axios');


router.get('/fetch-toilets', async (req, res) => {
  try {
    const toilets = await Toilet.find();
    res.json(toilets);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;

