import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadMedia, getAllMedia, deleteMedia } from '../controllers/mediaController.js';

const router = express.Router();

// Setup multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const cleanBase = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

// Configure file limits and filter types
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG/PNG/WEBP/GIF), videos (MP4/WEBM), and PDFs are allowed.'));
  },
});

// Public route for storefront artwork/logo upload (e.g. Bulk form)
router.post('/upload-public', upload.single('file'), uploadMedia);

// Protect all routes to Admin roles
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllMedia)
  .post(upload.single('file'), uploadMedia);

router.route('/:name')
  .delete(deleteMedia);

export default router;
