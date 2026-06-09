import express from 'express';
import {
  validateCouponCode,
  getCoupons,
  createCoupon,
  toggleCouponActiveState,
  deleteCoupon,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateCoupon } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public verification route
router.get('/validate/:code', validateCouponCode);

// Admin-only coupon controls
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getCoupons)
  .post(validateCoupon, createCoupon);

router.put('/:id/toggle', toggleCouponActiveState);
router.delete('/:id', deleteCoupon);

export default router;
