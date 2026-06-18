import fs from 'fs';
import path from 'path';

/**
 * Deletes a local uploaded file from public/uploads if the URL points to it.
 * @param {string} imageUrl The URL of the image asset.
 */
export const deleteLocalFile = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  try {
    // Check if it's a local uploaded file URL (contains '/uploads/')
    if (imageUrl.includes('/uploads/')) {
      const parts = imageUrl.split('/uploads/');
      const filename = parts[parts.length - 1];
      
      // Prevent directory traversal: extract only the base filename
      const safeFilename = path.basename(filename);
      const filePath = path.join('public/uploads', safeFilename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Media Cleanup] Successfully deleted old file from disk: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`[Media Cleanup] Error deleting old file: ${err.message}`);
  }
};
