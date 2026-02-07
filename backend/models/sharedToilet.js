const mongoose = require('mongoose');

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
    enum: ['free', 'free for customer', 'paid'],
    required: true
  },
  eircode: {
    type: String,
    required: true
  },
  price: {
    type: String,
    enum: ['€0.2', '€0.5', '€1', '€1.5', '€2'],
    required: function () {
      return this.type === 'paid';
    }
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
  },
  rejected: {
    type: Boolean,
    default: false 
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const SharedToilet = mongoose.model('SharedToilet', sharedToiletSchema, 'sharedToilet');

module.exports = SharedToilet;
