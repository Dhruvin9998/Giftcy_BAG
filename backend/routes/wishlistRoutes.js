import express from 'express';
import { getWishlist, toggleWishlistItem } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All wishlist routes require authentication

router.route('/')
  .get(getWishlist);

router.route('/:productId')
  .post(toggleWishlistItem);

export default router;
