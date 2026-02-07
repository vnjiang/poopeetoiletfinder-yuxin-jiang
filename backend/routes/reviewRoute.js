const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Toilet = require('../models/toilet');


router.get('/', (req, res) => {
  res.json({ message: "Review Route Working!" });
});



router.post('/ratings-batch', async (req, res) => {
  try {
    let { placeIds } = req.body;

    if (!Array.isArray(placeIds)) {
      return res.status(400).json({ message: 'placeIds must be an array' });
    }

    placeIds = [...new Set(placeIds.map(String))].filter(Boolean);


    if (placeIds.length > 500) {
      return res.status(413).json({ message: 'Too many placeIds' });
    }

    const agg = await Review.aggregate([
      { $match: { place_id: { $in: placeIds } } },
      {
        $group: {
          _id: '$place_id',
          averageRating: { $avg: '$rating' },   
          reviewCount: { $sum: 1 },
        },
      },
    ]);


    const map = {};
    for (const id of placeIds) {
      map[id] = { averageRating: 0, reviewCount: 0 };
    }
    for (const r of agg) {
      map[r._id] = {
        averageRating: r.averageRating ?? 0,
        reviewCount: r.reviewCount ?? 0,
      };
    }

    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to batch ratings' });
  }
});


//fetch review by user id 
//user.js
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const reviews = await Review.find({
      $or: [{ user_id: userId }, { userId: userId }],
    }).lean();

    if (!reviews.length) return res.json([]);

    const placeIds = [
      ...new Set(
        reviews
          .map(r => r.place_id)
          .filter(pid => typeof pid === 'string' && pid.trim().length > 0)
      ),
    ];

    if (!placeIds.length) {
  
      return res.json(
        reviews.map(r => ({ ...r, toilet_name: 'Unknown toilet' }))
      );
    }


    const toilets = await Toilet.find({
      place_id: { $in: placeIds },
    })
      .select('place_id toilet_name name') 
      .lean();

   
    const toiletMap = Object.create(null);
    for (const t of toilets) {
      toiletMap[t.place_id] = t.toilet_name || t.name || 'Unknown toilet';
    }


    const result = reviews.map(r => ({
      ...r,
      toilet_name: toiletMap[r.place_id] || 'Unknown toilet',
    }));

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch user reviews' });
  }
});




router.post('/', async (req, res) => {
  const { place_id, user_id, user_name, rating, comment } = req.body;

  try {
  
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
    return res.status(400).json({ message: error.message });
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
    return res.status(500).json({ message: error.message });
  }
});



//fetch review data by its place_id
router.get('/:place_id', async (req, res) => {
  try {
    const reviews = await Review.find({ place_id: req.params.place_id });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});





//delete review by id
router.delete('/:reviewId', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
});






module.exports = router;


