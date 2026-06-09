import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUserByAdmin,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Dashboard statistics
router.get('/dashboard', authorize('admin', 'staff'), getDashboardStats);

// User management
router.get('/users', authorize('admin', 'staff'), getAllUsers);
router.route('/users/:id')
  .put(authorize('admin'), updateUserRole)
  .delete(authorize('admin'), deleteUserByAdmin);

// Order management
router.get('/orders', authorize('admin', 'staff'), getAllOrders);
router.put('/orders/:id/status', authorize('admin', 'staff'), updateOrderStatus);

export default router;
