const mongoose = require('mongoose');

// 定义 Location Schema
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'], 
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});


const sharedToiletSchema = new mongoose.Schema({
  toilet_name: {
    type: String,
    required: true
  },
  toilet_description: String,
  type: {
    type: String,
    default: 'shared'
  },
  eircode: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  toilet_paper_accessibility: Boolean,
  contact_number: {
    type: String,
    required: true
  },
  location: {
    type: locationSchema,
    required: true
  },
  userId: String,
  approved_by_admin: {
    type: Boolean,
    default: false
  }
});

const SharedToilet = mongoose.model('SharedToilet', sharedToiletSchema, 'sharedToilet');

module.exports = SharedToilet;
