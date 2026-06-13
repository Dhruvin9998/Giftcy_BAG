import express from 'express';
import {
  createOrder,
  verifyRazorpayPayment,
  stripeWebhook,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Stripe webhook receiver
router.post('/webhook/stripe', stripeWebhook);

// Protected order routes
router.use(protect);

router.route('/')
  .get(getMyOrders)
  .post(createOrder);

router.post('/verify-razorpay', verifyRazorpayPayment);
router.post('/verify', verifyRazorpayPayment);
router.get('/my-orders', getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/cancel', cancelOrder);

export default router;
