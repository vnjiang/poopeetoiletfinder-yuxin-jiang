const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  place_id: { type: String, required: true },
  toilet_name: String,
  toilet_description: String,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  type: String,
  review_id: [String],
  price: Number,
  toilet_paper_accessibility: Boolean
});



module.exports = mongoose.model('Toilet', toiletSchema);



