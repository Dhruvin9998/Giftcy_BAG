import ApiError from '../utils/apiError.js';

// Validate User Registration
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ApiError(400, 'Please provide name, email, and password'));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, 'Please provide a valid email address'));
  }
  if (password.length < 6) {
    return next(new ApiError(400, 'Password must be at least 6 characters long'));
  }
  next();
};

// Validate User Login
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide both email and password'));
  }
  next();
};

// Validate Forgot Password request
export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError(400, 'Please provide an email address'));
  }
  next();
};

// Validate Reset Password request
export const validateResetPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return next(new ApiError(400, 'Please provide a password of at least 6 characters'));
  }
  next();
};

// Validate Product Creation
export const validateProduct = (req, res, next) => {
  const { name, description, price, category, stock, images } = req.body;
  if (!name || !description || price === undefined || !category || stock === undefined || !images) {
    return next(new ApiError(400, 'Please provide all required fields: name, description, price, category, stock, and images'));
  }
  if (price < 0) {
    return next(new ApiError(400, 'Price must be a positive number'));
  }
  if (stock < 0) {
    return next(new ApiError(400, 'Stock cannot be negative'));
  }
  if (!Array.isArray(images) || images.length === 0) {
    return next(new ApiError(400, 'Please provide at least one image URL'));
  }
  next();
};

// Validate Review Submittals
export const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;
  if (rating === undefined || !comment) {
    return next(new ApiError(400, 'Please provide a rating and a comment'));
  }
  if (rating < 1 || rating > 5) {
    return next(new ApiError(400, 'Rating must be between 1 and 5'));
  }
  next();
};

// Validate Coupon codes
export const validateCoupon = (req, res, next) => {
  const { code, discountType, discountAmount, expiryDate } = req.body;
  if (!code || !discountType || discountAmount === undefined || !expiryDate) {
    return next(new ApiError(400, 'Please provide all fields: code, discountType, discountAmount, expiryDate'));
  }
  if (!['percentage', 'fixed'].includes(discountType)) {
    return next(new ApiError(400, 'Discount type must be percentage or fixed'));
  }
  if (discountAmount <= 0) {
    return next(new ApiError(400, 'Discount amount must be greater than zero'));
  }
  next();
};
