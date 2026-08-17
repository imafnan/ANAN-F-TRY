import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 },
  minPurchase: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, min: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, required: true, min: 1 },
  usageCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

couponSchema.index({ code: 1, isActive: 1 });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
