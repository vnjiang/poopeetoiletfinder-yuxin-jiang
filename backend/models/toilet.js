const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  place_id: { type: String, required: true },
  toilet_name: String,
  toilet_description: String,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  type: {
    type: String,
    enum: ['free', 'free for customer', 'paid'],
    required: true
  },
  review_id: [String],
  price: {
    type: String,
    enum: ['free', 'free for customer', '0.2 Euro', '0.5 Euro', '1 Euro', '1.5 Euro', '2 Euro'],
    required: true
  },

  toilet_paper_accessibility: Boolean
});



module.exports = mongoose.model('Toilet', toiletSchema);



