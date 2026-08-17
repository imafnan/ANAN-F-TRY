import mongoose, { Schema } from 'mongoose';

const pathaoTokenSchema = new Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

export const PathaoToken = mongoose.models.PathaoToken || mongoose.model('PathaoToken', pathaoTokenSchema);
