import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUserByAdmin,
  getAllOrders,
  updateOrderStatus,
  toggleBlockUser,
  resetUserPasswordByAdmin,
  getStockStatus,
  getAllSupportMessages,
  updateSupportMessageStatus,
  deleteSupportMessage,
  replySupportMessage,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Dashboard statistics
router.get('/dashboard', authorize('admin', 'staff'), getDashboardStats);
router.get('/stock-status', authorize('admin', 'staff'), getStockStatus);

// User management
router.get('/users', authorize('admin', 'staff'), getAllUsers);
router.put('/users/:id/block', authorize('admin'), toggleBlockUser);
router.put('/users/:id/reset-password', authorize('admin'), resetUserPasswordByAdmin);

router.route('/users/:id')
  .put(authorize('admin'), updateUserRole)
  .delete(authorize('admin'), deleteUserByAdmin);

// Support messages management
router.get('/support-messages', authorize('admin', 'staff'), getAllSupportMessages);
router.put('/support-messages/:id/status', authorize('admin'), updateSupportMessageStatus);
router.put('/support-messages/:id/reply', authorize('admin'), replySupportMessage);
router.delete('/support-messages/:id', authorize('admin'), deleteSupportMessage);

// Order management
router.get('/orders', authorize('admin', 'staff'), getAllOrders);
router.put('/orders/:id/status', authorize('admin', 'staff'), updateOrderStatus);

export default router;
