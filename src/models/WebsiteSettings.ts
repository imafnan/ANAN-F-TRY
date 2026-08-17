import mongoose, { Schema } from 'mongoose';

const websiteSettingsSchema = new Schema({
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  businessPhone: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  supportEmail: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  tiktokUrl: { type: String, default: '' },
  courier: {
    pathao: {
      enabled: { type: Boolean, default: false },
      baseUrl: { type: String, default: 'https://api-hermes.pathao.com' },
      clientId: { type: String, default: '' },
      clientSecret: { type: String, default: '' },
      username: { type: String, default: '' },
      password: { type: String, default: '' },
      storeId: { type: String, default: '' }
    }
  }
}, {
  timestamps: true
});

export const WebsiteSettings = mongoose.models.WebsiteSettings || mongoose.model('WebsiteSettings', websiteSettingsSchema);
