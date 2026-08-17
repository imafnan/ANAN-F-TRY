import mongoose, { Schema } from 'mongoose';

const orderCounterSchema = new Schema({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

export const OrderCounter = mongoose.models.OrderCounter || mongoose.model('OrderCounter', orderCounterSchema);
