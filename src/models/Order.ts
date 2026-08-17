import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    note: { type: String, default: '' }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  coupon: {
    code: { type: String, default: '' },
    discount: { type: Number, default: 0 }
  },
  discountAmount: { type: Number, default: 0, min: 0 },
  deliveryCharge: { type: Number, required: true, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending',
    index: true
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned'
    ],
    default: 'Pending',
    index: true
  },
  stockAdjustmentState: {
    type: String,
    enum: ['Pending', 'Adjusted', 'Restored'],
    default: 'Pending'
  },
  pathao: {
    booked: { type: Boolean, default: false },
    consignmentId: { type: String, default: '', index: true },
    merchantOrderId: { type: String, default: '' },
    status: { type: String, default: '' },
    statusSlug: { type: String, default: '' },
    deliveryFee: { type: Number, default: 0 },
    lastSyncedAt: { type: Date },
    response: { type: Schema.Types.Mixed }
  }
}, {
  timestamps: true
});

orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
