import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

// =========================================================================
// CART CONTROLLERS
// =========================================================================

/**
 * @desc    Get current user's cart items
 * @route   GET /api/v1/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price compareAtPrice images stock slug');

    // Create cart if not exists
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    new ApiResponse(200, cart, 'Cart retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return next(new ApiError(400, 'Product ID is required'));
    }

    // Verify Product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Check stock
    if (product.stock < quantity) {
      return next(new ApiError(400, `Insufficient stock. Only ${product.stock} items left.`));
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Validate cumulative quantity against stock
      const newQuantity = cart.items[itemIndex].quantity + Number(quantity);
      if (product.stock < newQuantity) {
        return next(new ApiError(400, `Cannot add quantity. Total items in cart (${newQuantity}) exceeds stock (${product.stock}).`));
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();

    // Populate and return updated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price compareAtPrice images stock slug');
    new ApiResponse(200, populatedCart, 'Item added to cart.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity of product in cart
 * @route   PUT /api/v1/cart/:productId
 * @access  Private
 */
export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return next(new ApiError(400, 'Quantity must be at least 1'));
    }

    // Verify Product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Verify stock
    if (product.stock < quantity) {
      return next(new ApiError(400, `Only ${product.stock} items available in stock.`));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ApiError(404, 'Cart not found'));
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return next(new ApiError(404, 'Product not found in cart'));
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price compareAtPrice images stock slug');
    new ApiResponse(200, populatedCart, 'Cart quantity updated.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/v1/cart/:productId
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ApiError(404, 'Cart not found'));
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price compareAtPrice images stock slug');
    new ApiResponse(200, populatedCart, 'Item removed from cart.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all items in cart
 * @route   DELETE /api/v1/cart/clear
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    new ApiResponse(200, cart, 'Cart cleared successfully.').send(res);
  } catch (error) {
    next(error);
  }
};


// =========================================================================
// WISHLIST CONTROLLERS
// =========================================================================

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products', 'name price compareAtPrice images stock slug ratings');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    new ApiResponse(200, wishlist, 'Wishlist retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle item in wishlist (Add if not present, remove if present)
 * @route   POST /api/v1/wishlist/:productId
 * @access  Private
 */
export const toggleWishlistItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    const isProductInWishlist = wishlist.products.includes(productId);

    if (isProductInWishlist) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products', 'name price compareAtPrice images stock slug ratings');
    
    const message = isProductInWishlist ? 'Product removed from wishlist.' : 'Product added to wishlist.';
    new ApiResponse(200, populatedWishlist, message).send(res);
  } catch (error) {
    next(error);
  }
};
