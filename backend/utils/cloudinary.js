import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/"/g, '');
const apiKey = (process.env.CLOUDINARY_API_KEY || '').replace(/"/g, '');
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').replace(/"/g, '');

const isConfigured = cloudName && apiKey && apiSecret;

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/**
 * Upload a local file to Cloudinary
 * @param {string} localFilePath Path to local temporary file
 * @param {string} folder Target folder name on Cloudinary
 * @returns {Promise<{url: string, public_id: string} | null>} Upload result or null if not configured
 */
export const uploadToCloudinary = async (localFilePath, folder = 'giftcy') => {
  if (!isConfigured) {
    console.warn('[Cloudinary] Warning: Cloudinary is not configured. Falling back to local storage.');
    return null;
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: 'auto',
    });

    // Remove the file from local temporary directory after upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    // Delete file locally even if upload failed to prevent accumulation
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error('[Cloudinary] Upload failed:', error);
    throw error;
  }
};

export default cloudinary;
