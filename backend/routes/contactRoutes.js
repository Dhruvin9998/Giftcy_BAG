import express from 'express';
import { submitContactForm, getMyContactMessages } from '../controllers/adminController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, submitContactForm);
router.get('/my-messages', protect, getMyContactMessages);

export default router;
