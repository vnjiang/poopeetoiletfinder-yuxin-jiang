const express = require('express');
const router = express.Router();
const Toilet = require('../models/toilet'); 

router.get('/', async (req, res) => {
  try {
    const toiletData = await Toilet.find();
    res.json(toiletData);//change to json
  } catch (error) {
    console.log(error)
  }
});

router.post('/', async (req, res) => {
  try {
    const newToiletData = await new Toilet(req.body).save();//get data from client and save to mongo
    res.json(newToiletData);
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;

