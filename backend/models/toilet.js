const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  toilet_id: String,
  toilet_name: String,
  toilet_description: String,
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number]
  },
  type: String,
  review_ids: [String],
  price: Number,
  toilet_paper_accessibility: Boolean
});


module.exports = mongoose.model('Toilet', toiletSchema);





