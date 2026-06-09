import express from 'express';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBanners);

// Admin-protected routes
router.use(protect);
router.use(authorize('admin'));
router.post('/', createBanner);
router.route('/:id')
  .put(updateBanner)
  .delete(deleteBanner);

export default router;
