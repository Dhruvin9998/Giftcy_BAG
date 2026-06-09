import express from 'express';
import { addReview, getReviews, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateReview } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/:productId')
  .get(getReviews)
  .post(protect, validateReview, addReview);

router.route('/:id')
  .delete(protect, deleteReview);

export default router;
