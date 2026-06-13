import express from 'express';
import {
  signup,
  verifyOTP,
  resendOTP,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  claimFirstAdmin,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';
import User from '../models/User.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/debug-otp/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, otp: user.otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/signup', validateRegister, signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', authLimiter, validateLogin, login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:token', validateResetPassword, resetPassword);

// Protected profile routes
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put('/claim-first-admin', protect, claimFirstAdmin);

export default router;
