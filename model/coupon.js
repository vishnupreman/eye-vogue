const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,  
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],  
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderValue: {
    type: Number,
    default: 0,  
  },
  maxDiscountValue: {
    type: Number,
    default: null, 
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  expiresAt: {
    type: Date,
    required: true, 
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, 
{
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
