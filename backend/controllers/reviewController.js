import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

// =========================================================================
// REVIEW CONTROLLERS
// =========================================================================

/**
 * @desc    Add a review for a product (Verified purchase check included)
 * @route   POST /api/v1/reviews/:productId
 * @access  Private
 */
export const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Verified Purchase Check: Check if user has ordered this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      status: 'Delivered',
      'orderItems.product': productId,
    });

    if (!hasPurchased) {
      return next(new ApiError(403, 'You can only review products you have purchased and received (Delivered).'));
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (alreadyReviewed) {
      // Update existing review instead of creating duplicate
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      await alreadyReviewed.save();

      // Recalculate average rating (handled by model save hooks)
      return new ApiResponse(200, alreadyReviewed, 'Review updated successfully.').send(res);
    }

    // Create new review
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    new ApiResponse(201, review, 'Review added successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a product
 * @route   GET /api/v1/reviews/:productId
 * @access  Public
 */
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort('-createdAt');
    new ApiResponse(200, reviews, 'Reviews fetched successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ApiError(404, 'Review not found'));
    }

    // Authorized check: owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to delete this review'));
    }

    await Review.findByIdAndDelete(req.params.id);
    new ApiResponse(200, null, 'Review deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};


// =========================================================================
// COUPON CONTROLLERS
// =========================================================================

/**
 * @desc    Validate coupon & get discount
 * @route   GET /api/v1/coupons/validate/:code
 * @access  Public (Requires cart subtotal check)
 */
export const validateCouponCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { subtotal = 0 } = req.query;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return next(new ApiError(404, 'Invalid coupon code.'));
    }

    if (!coupon.active) {
      return next(new ApiError(400, 'This coupon is no longer active.'));
    }

    if (new Date() > coupon.expiryDate) {
      return next(new ApiError(400, 'This coupon has expired.'));
    }

    const currentSubtotal = Number(subtotal);
    if (currentSubtotal < coupon.minCartAmount) {
      return next(
        new ApiError(
          400,
          `Minimum cart amount of $${coupon.minCartAmount} required to apply this coupon.`
        )
      );
    }

    new ApiResponse(200, coupon, 'Coupon validated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coupons
 * @route   GET /api/v1/coupons
 * @access  Private/Admin
 */
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    new ApiResponse(200, coupons, 'Coupons list retrieved.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/coupons
 * @access  Private/Admin
 */
export const createCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return next(new ApiError(400, 'Coupon code already exists'));
    }

    const coupon = await Coupon.create({
      ...req.body,
      code: code.toUpperCase(),
    });

    new ApiResponse(201, coupon, 'Coupon created successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle coupon active state
 * @route   PUT /api/v1/coupons/:id/toggle
 * @access  Private/Admin
 */
export const toggleCouponActiveState = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return next(new ApiError(404, 'Coupon not found'));
    }

    coupon.active = !coupon.active;
    await coupon.save();

    new ApiResponse(200, coupon, 'Coupon active status toggled.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return next(new ApiError(404, 'Coupon not found'));
    }

    await Coupon.findByIdAndDelete(req.params.id);
    new ApiResponse(200, null, 'Coupon deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};
