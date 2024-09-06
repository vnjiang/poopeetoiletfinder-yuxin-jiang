const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Toilet = require('../models/toilet');


router.get('/:toiletId', async (req, res) => {
  try {
    console.log('Fetching reviews for toilet ID:', req.params.toiletId); 
    const toilet = await Toilet.findOne({ toilet_id: req.params.toiletId }).exec();
    if (!toilet) {
      console.log('Toilet not found');
      return res.status(404).json({ message: 'Toilet not found' });
    }

    console.log('Toilet found:', toilet);
    const reviews = await Review.find({ toilet_id: req.params.toiletId }).exec(); 
    console.log('Reviews found:', reviews);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.get('/:toiletId/average-rating', async (req, res) => {
  try {
    const { toiletId } = req.params;
    
    const result = await Review.aggregate([
      { $match: { toilet_id: toiletId } },
      { $group: { _id: "$toilet_id", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } } // 添加 reviewCount
    ]);

    if (result.length > 0) {
      res.json({ averageRating: result[0].averageRating, reviewCount: result[0].reviewCount }); // 返回 reviewCount
    } else {
      res.json({ averageRating: null, reviewCount: 0 }); // 如果没有评论，返回 0
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




router.post('/', async (req, res) => {
  try {
    const { review_id, toilet_id, user_id, user_name, rating, comment, created_date } = req.body;

    const newReview = new Review({
      review_id,
      toilet_id,
      user_id,
      user_name, 
      rating,
      comment,
      created_date: created_date || new Date()
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err) {
    res.status(500).json({ message: 'Error creating review: ' + err.message });
  }
});



router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.params.userId }).exec();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.delete('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;


