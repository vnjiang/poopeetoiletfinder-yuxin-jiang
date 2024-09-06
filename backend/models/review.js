const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review_id: String,
  toilet_id: String,
  user_id: String,
  user_name: String,
  rating: Number,
  comment: String,
  created_date: Date
});

const review = mongoose.model('review', reviewSchema);

module.exports = review;
