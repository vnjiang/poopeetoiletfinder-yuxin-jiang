const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  place_id: { type: String, required: true },
  toilet_name: String,
  toilet_description: String,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },

  // 收费类型：只在这里区分 free / free for customer / paid
  type: {
    type: String,
    enum: ['free', 'free for customer', 'paid'],
    required: true
  },

  review_id: [String],

  // 具体金额：只有 paid 的时候才需要
  price: {
    type: String,
    enum: ['€0.2', '€0.5', '€1', '€1.5', '€2'],   // ⚠️ 去掉 'free' 和 'free for customer'
    required: function () {
      return this.type === 'paid';               // 只有付费厕所必须填 price
    }
  },

  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  toilet_paper_accessibility: Boolean
});




module.exports = mongoose.model('Toilet', toiletSchema);



