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
router.use(authorize('admin')); // Restrict all paths inside this router to admins

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.route('/users/:id')
  .put(updateUserRole)
  .delete(deleteUserByAdmin);

// Order management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
