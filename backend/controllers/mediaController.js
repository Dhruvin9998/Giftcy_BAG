import fs from 'fs';
import path from 'path';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

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

    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    new ApiResponse(
      201,
      {
        name: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      'File uploaded successfully.'
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
    if (!fs.existsSync(uploadDir)) {
      return new ApiResponse(200, [], 'No media files found (directory empty).').send(res);
    }

    const files = await fs.promises.readdir(uploadDir);
    const mediaList = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await fs.promises.stat(filePath);
        const protocol = req.protocol;
        const host = req.get('host');
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

    new ApiResponse(200, mediaList, 'Media library assets retrieved.').send(res);
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
    const filename = req.params.name;
    const filePath = path.join(uploadDir, filename);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(uploadDir)) {
      return next(new ApiError(400, 'Invalid file path'));
    }

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
