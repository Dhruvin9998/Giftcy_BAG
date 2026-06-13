import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart routes require user authentication

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/clear')
  .delete(clearCart);

router.post('/add', addToCart);
router.put('/update', updateCartItemQuantity);
router.post('/update', updateCartItemQuantity);
router.delete('/remove', removeFromCart);
router.post('/remove', removeFromCart);

router.route('/:productId')
  .put(updateCartItemQuantity)
  .delete(removeFromCart);

export default router;
