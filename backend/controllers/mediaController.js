import fs from 'fs';
import path from 'path';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import cloudinary, { uploadToCloudinary } from '../utils/cloudinary.js';

const uploadDir = path.resolve('public/uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * @desc    Upload media file
 * @route   POST /api/v1/media
 * @access  Private/Admin
 */
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please upload a file'));
    }

    const localFilePath = req.file.path;

    // Upload to Cloudinary if keys are configured
    const cloudinaryResult = await uploadToCloudinary(localFilePath, 'giftcy_uploads');

    if (cloudinaryResult) {
      return new ApiResponse(
        201,
        {
          name: req.file.filename,
          url: cloudinaryResult.url,
          size: req.file.size,
          mimetype: req.file.mimetype,
          public_id: cloudinaryResult.public_id,
        },
        'File uploaded successfully to Cloudinary.'
      ).send(res);
    }

    // Fallback: local hosting
    const host = req.get('host');
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? (req.headers['x-forwarded-proto'] || req.protocol) : 'https';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    new ApiResponse(
      201,
      {
        name: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      'File uploaded successfully to local storage.'
    ).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all uploaded media assets
 * @route   GET /api/v1/media
 * @access  Private/Admin
 */
export const getAllMedia = async (req, res, next) => {
  try {
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 100,
      });

      const mediaList = result.resources.map((resource) => {
        return {
          name: resource.public_id,
          url: resource.secure_url,
          size: resource.bytes,
          createdAt: resource.created_at,
          mimetype: `${resource.resource_type}/${resource.format}`,
        };
      });

      return new ApiResponse(200, mediaList, 'Media library assets retrieved from Cloudinary.').send(res);
    }

    if (!fs.existsSync(uploadDir)) {
      return new ApiResponse(200, [], 'No media files found (directory empty).').send(res);
    }

    const files = await fs.promises.readdir(uploadDir);
    const mediaList = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await fs.promises.stat(filePath);
        const host = req.get('host');
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
        const protocol = isLocal ? (req.headers['x-forwarded-proto'] || req.protocol) : 'https';
        const fileUrl = `${protocol}://${host}/uploads/${filename}`;

        return {
          name: filename,
          url: fileUrl,
          size: stats.size,
          createdAt: stats.birthtime,
          mimetype: getMimeType(filename),
        };
      })
    );

    // Sort by creation date descending
    mediaList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    new ApiResponse(200, mediaList, 'Media library assets retrieved from local storage.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a media file
 * @route   DELETE /api/v1/media/:name
 * @access  Private/Admin
 */
export const deleteMedia = async (req, res, next) => {
  try {
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      const publicId = req.params.name + (req.params[0] || '');
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        return new ApiResponse(200, null, 'File deleted successfully from Cloudinary.').send(res);
      } else {
        return next(new ApiError(404, `Cloudinary deletion failed: ${result.result}`));
      }
    }

    const filename = req.params.name;
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return next(new ApiError(404, 'File not found on disk'));
    }

    await fs.promises.unlink(filePath);
    new ApiResponse(200, null, 'File deleted successfully from disk.').send(res);
  } catch (error) {
    next(error);
  }
};

// Simple helper to deduce mime-type
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
}
