import express from 'express';
import {
  submitBulkInquiry,
  getAllBulkInquiries,
  updateInquiryStatus,
} from '../controllers/bulkInquiryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public submissions
router.post('/submit', submitBulkInquiry);

// Admin-protected listings & updates
router.use(protect);
router.use(authorize('admin'));
router.get('/', getAllBulkInquiries);
router.put('/:id/status', updateInquiryStatus);

export default router;
