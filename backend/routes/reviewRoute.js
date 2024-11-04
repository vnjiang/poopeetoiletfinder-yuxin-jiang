const express = require('express');
const router = express.Router();
const Review = require('../models/review');


//fetch review data by its place_id
router.get('/:place_id', async (req, res) => {
  try {
    const reviews = await Review.find({ place_id: req.params.place_id });
    res.json(reviews);
  } catch (error) {
    console.error(error);
  }
});


//calculate toilet's average rating by its place_id
//utils.js
router.get('/:place_id/average-rating', async (req, res) => {
  try {
    const reviews = await Review.find({ place_id: req.params.place_id });
    //add all rating together
    let totalRating = 0;
    for (const review of reviews) {
      totalRating += review.rating;
    }
    const reviewCount = reviews.length;
    //calculate average rating if there is review
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    res.json({ averageRating, reviewCount });
  } catch (error) {
    console.error(error);
  }
});




//post reviews to review data base
router.post('/', async (req, res) => {
  const { place_id, user_id, user_name, rating, comment } = req.body;

  try {
    //create new review and save to data base
    const newReview = new Review({
      review_id: `review_${Date.now()}`,  
      place_id,
      user_id,
      user_name,
      rating,
      comment,
      created_date: new Date()  
    });
    await newReview.save();

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error(error);
  }
});



//fetch review by user id 
//user.js
router.get('/user/:userId', async (req, res) => {
  try {
    const reviewDataByUserID = await Review.find({ user_id: req.params.userId });
    res.json(reviewDataByUserID);
  } catch (error) {
    console.error(error);
  }
});



//delete review by id
router.delete('/:reviewId', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId);
    res.status(204).end();
  } catch (error) {
    console.error(error);
  }
});



module.exports = router;


