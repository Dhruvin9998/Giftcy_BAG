import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountAmount: {
      type: Number,
      required: [true, 'Please provide discount amount'],
      min: [0, 'Discount must be positive'],
    },
    minCartAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum cart amount must be positive'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify expiry date'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if coupon is valid
couponSchema.methods.isValid = function (cartAmount = 0) {
  const isExpired = new Date() > this.expiryDate;
  const isBelowMinAmount = cartAmount < this.minCartAmount;
  return this.active && !isExpired && !isBelowMinAmount;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
