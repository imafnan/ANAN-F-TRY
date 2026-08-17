import mongoose, { Schema } from 'mongoose';

const variantSchema = new Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 }
}, { _id: false });

const cloudinaryImageSchema = new Schema({
  publicId: { type: String, required: true },
  secureUrl: { type: String, required: true },
  width: { type: Number },
  height: { type: Number }
}, { _id: false });

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  costPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  images: [cloudinaryImageSchema],
  variants: [variantSchema],
  weight: { type: Number, default: 0.5, min: 0 },
  isActive: { type: Boolean, default: true, index: true }
}, {
  timestamps: true
});

productSchema.index({ isActive: 1, createdAt: -1 });

productSchema.virtual('totalStock').get(function() {
  return (this.variants as any[]).reduce((acc: number, curr: any) => acc + curr.stock, 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
