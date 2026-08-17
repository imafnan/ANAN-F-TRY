import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

export const getCloudinary = () => {
  if (!isConfigured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      const missing: string[] = [];
      if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
      if (!apiKey) missing.push('CLOUDINARY_API_KEY');
      if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
      console.error(`[CLOUDINARY] Missing environment variables: ${missing.join(', ')}`);
      throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    isConfigured = true;
  }

  return cloudinary;
};

export default getCloudinary;
