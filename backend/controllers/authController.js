import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { sendOTPEmail, sendResetPasswordEmail } from '../services/emailService.js';

// Initialize Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper to send token response (supports cookies and JSON)
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  new ApiResponse(statusCode, { user: userResponse, token }, message).send(res);
};

/**
 * @desc    Register a new user (generates verification OTP)
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ApiError(400, 'User already exists with this email address'));
    }

    // Generate a 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user in inactive status
    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpires,
    });

    // Send OTP verification email
    try {
      await sendOTPEmail(user.email, otp);
    } catch (err) {
      // Rollback user creation if email fails to avoid dead states
      await User.findByIdAndDelete(user._id);
      return next(new ApiError(500, `Failed to send verification email. Details: ${err.message}`));
    }

    new ApiResponse(
      201,
      { email: user.email },
      'Registration successful. Please verify your email with the OTP sent.'
    ).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP for registration
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ApiError(400, 'Please provide email and verification code'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Check if OTP matches and has not expired
    if (user.otp !== otp || new Date() > user.otpExpires) {
      return next(new ApiError(400, 'Invalid or expired OTP verification code'));
    }

    // Verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    sendTokenResponse(user, 200, res, 'Email verification completed successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP verification code (with 60s cooldown)
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ApiError(400, 'Please provide your email address'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(404, 'No account found with this email address'));
    }

    if (user.isVerified) {
      return next(new ApiError(400, 'This account is already verified'));
    }

    // Rate-limit: check if OTP was sent less than 60 seconds ago
    if (user.otpExpires) {
      const otpSentAt = new Date(user.otpExpires.getTime() - 10 * 60 * 1000);
      const secondsSinceSent = (Date.now() - otpSentAt.getTime()) / 1000;
      if (secondsSinceSent < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceSent);
        return next(new ApiError(429, `Please wait ${waitSeconds} seconds before requesting a new code`));
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(user.email, otp);
    } catch (err) {
      return next(new ApiError(500, `Failed to send verification email. Details: ${err.message}`));
    }

    new ApiResponse(
      200,
      { email: user.email },
      'A new verification code has been sent to your email.'
    ).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Regenerate OTP and send again
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendOTPEmail(user.email, otp);
      } catch (err) {
        console.error('Failed to send OTP email during login:', err.message);
      }

      // Return a structured response instead of an error so the frontend can handle the OTP flow
      return new ApiResponse(
        200,
        { requiresVerification: true, email: user.email },
        'Your account is not verified yet. A verification code has been sent to your email.'
      ).send(res);
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google Sign-In Authentication (OAuth 2.0 exchange)
 * @route   POST /api/v1/auth/google-login
 * @access  Public
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return next(new ApiError(400, 'Google OAuth credentials missing.'));
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (err) {
      // Fallback verification for mock credential during development
      if (process.env.NODE_ENV === 'development' && credential.startsWith('mock_token_')) {
        const dummyEmail = credential.replace('mock_token_', '') + '@gmail.com';
        let user = await User.findOne({ email: dummyEmail });
        if (!user) {
          user = await User.create({
            name: 'Google User',
            email: dummyEmail,
            isVerified: true,
            googleId: `google_mock_${Date.now()}`,
          });
        }
        return sendTokenResponse(user, 200, res, 'Logged in successfully with Google (Mock Auth).');
      }
      return next(new ApiError(401, 'Google authentication failed. Credentials invalid.'));
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Find user by email or googleId
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if not populated
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true; // Google accounts are verified
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true, // Google accounts are auto-verified
      });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully with Google OAuth.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send reset password URL
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(404, 'No account exists with this email address'));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set reset fields
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Reset password URL
    const resetUrl = `${process.env.FRONTEND_URL}/auth?mode=reset&token=${resetToken}`;

    try {
      await sendResetPasswordEmail(user.email, resetUrl);
      new ApiResponse(200, null, 'Reset link sent to your email.').send(res);
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return next(new ApiError(500, 'Unable to send reset password email. Please try again.'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset user password
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash param token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError(400, 'Invalid or expired password reset token'));
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.isVerified = true; // Make sure user is verified upon reset
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    new ApiResponse(200, { user }, 'Profile retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile properties
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    
    if (email && email !== user.email) {
      // Check if email already registered
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return next(new ApiError(400, 'Email address already in use'));
      }
      user.email = email;
    }

    if (password) {
      user.password = password;
    }

    await user.save();
    new ApiResponse(200, { user }, 'Profile updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Claim first admin role if no admin exists
 * @route   PUT /api/v1/auth/claim-first-admin
 * @access  Private
 */
export const claimFirstAdmin = async (req, res, next) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return next(new ApiError(400, 'An admin already exists.'));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    user.role = 'admin';
    await user.save();

    new ApiResponse(200, { user }, 'You are now an admin!').send(res);
  } catch (error) {
    next(error);
  }
};

