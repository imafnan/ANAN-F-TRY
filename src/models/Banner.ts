import mongoose, { Schema } from 'mongoose';

const cloudinaryImageSchema = new Schema({
  publicId: { type: String, required: true },
  secureUrl: { type: String, required: true },
  width: { type: Number },
  height: { type: Number }
}, { _id: false });

const bannerSchema = new Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  ctaText: { type: String, trim: true },
  ctaUrl: { type: String, trim: true },
  image: { type: cloudinaryImageSchema, required: true },
  isActive: { type: Boolean, default: true, index: true }
}, {
  timestamps: true
});

bannerSchema.index({ isActive: 1, createdAt: -1 });

export const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
