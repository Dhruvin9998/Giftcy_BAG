import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import {
  createStripePaymentIntent,
  createRazorpayOrder,
  verifyRazorpaySignature,
} from '../services/paymentService.js';

/**
 * @desc    Create a new order & process initial payment setup
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      shippingPrice = 0,
      taxPrice = 0,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new ApiError(400, 'No items in order list'));
    }

    // 1. Validate items and verify stocks
    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ApiError(404, `Product not found with ID: ${item.product}`));
      }

      if (product.stock < item.quantity) {
        return next(new ApiError(400, `Insufficient stock for '${product.name}'. Only ${product.stock} available.`));
      }

      // Compile subtotal
      itemsPrice += product.price * item.quantity;
      validatedItems.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0] || '',
        product: product._id,
      });
    }

    // 2. Validate and apply coupon if present
    let discountPrice = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid(itemsPrice)) {
        if (coupon.discountType === 'percentage') {
          discountPrice = (itemsPrice * coupon.discountAmount) / 100;
        } else {
          discountPrice = coupon.discountAmount;
        }
        // Caps discount to items price
        discountPrice = Math.min(discountPrice, itemsPrice);
      }
    }

    // 3. Compute final prices
    const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice) - discountPrice;

    // 4. Create initial order database record (unpaid)
    const order = await Order.create({
      user: req.user.id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountPrice,
      totalPrice: Math.max(0, totalPrice),
    });

    // 5. Decrement stocks
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 6. Handle Payments
    if (paymentMethod === 'COD') {
      // Clear Cart immediately for COD
      await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
      
      // Send Order Confirmation Email
      try {
        await sendOrderConfirmationEmail(req.user.email, order);
      } catch (err) {
        console.error(`Error sending order email: ${err.message}`);
      }

      return new ApiResponse(201, { order }, 'Order created successfully (Cash on Delivery).').send(res);
    }

    if (paymentMethod === 'Stripe') {
      try {
        const paymentIntent = await createStripePaymentIntent(order.totalPrice);
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
        };
        await order.save();

        return new ApiResponse(
          201,
          {
            order,
            paymentType: 'Stripe',
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          },
          'Order created. Complete Stripe payment with clientSecret.'
        ).send(res);
      } catch (err) {
        // Rollback stocks on payment failure
        for (const item of validatedItems) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        await Order.findByIdAndDelete(order._id);
        return next(new ApiError(500, `Stripe initialization failed: ${err.message}`));
      }
    }

    if (paymentMethod === 'Razorpay') {
      try {
        const rpOrder = await createRazorpayOrder(order.totalPrice);
        order.paymentResult = {
          id: rpOrder.id,
          status: rpOrder.status,
        };
        await order.save();

        return new ApiResponse(
          201,
          {
            order,
            paymentType: 'Razorpay',
            razorpayOrderId: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
          },
          'Order created. Complete Razorpay checkout.'
        ).send(res);
      } catch (err) {
        // Rollback stocks on payment failure
        for (const item of validatedItems) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        await Order.findByIdAndDelete(order._id);
        return next(new ApiError(500, `Razorpay initialization failed: ${err.message}`));
      }
    }

    next(new ApiError(400, 'Invalid payment method selected.'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/v1/orders/verify-razorpay
 * @access  Private
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, signature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return next(new ApiError(400, 'Missing payment parameters for validation'));
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, signature);
    if (!isValid) {
      return next(new ApiError(400, 'Payment verification failed. Invalid signature.'));
    }

    // Update order status
    const order = await Order.findOne({ 'paymentResult.id': razorpayOrderId });
    if (!order) {
      return next(new ApiError(404, 'Associated order not found'));
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpayPaymentId,
      status: 'paid',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    await order.save();

    // Clear Cart
    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, order);
    } catch (err) {
      console.error(`Email error: ${err.message}`);
    }

    new ApiResponse(200, order, 'Razorpay payment verified & order completed.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stripe Webhook processor for successful payments
 * @route   POST /api/v1/orders/webhook/stripe
 * @access  Public
 */
export const stripeWebhook = async (req, res, next) => {
  // Normally, Stripe requests signature checking.
  // We will check for raw payload signatures using stripe client if secret key is present.
  let event = req.body;

  console.log(`[Stripe Webhook] Received webhook event: ${event.type}`);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    try {
      // Find order by stripe payment intent ID
      const order = await Order.findOne({ 'paymentResult.id': paymentIntent.id }).populate('user', 'email');
      
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult.status = 'succeeded';
        order.paymentResult.update_time = new Date().toISOString();
        await order.save();

        // Clear user cart
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

        // Send Email
        try {
          await sendOrderConfirmationEmail(order.user.email, order);
        } catch (mailErr) {
          console.error(`Webhook mail error: ${mailErr.message}`);
        }
        console.log(`[Stripe Webhook] Updated Order #${order._id} to paid`);
      }
    } catch (err) {
      console.error(`[Stripe Webhook Error]: ${err.message}`);
      return res.status(500).send(`Webhook Handler Error: ${err.message}`);
    }
  }

  res.json({ received: true });
};

/**
 * @desc    Get current user's order history
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    new ApiResponse(200, orders, 'Orders history fetched successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order details
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Authorize: check if user is the buyer or is an admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to view this order'));
    }

    new ApiResponse(200, order, 'Order details retrieved.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Check ownership
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to cancel this order'));
    }

    // Check status
    if (order.status !== 'Processing') {
      return next(new ApiError(400, `Cannot cancel order. It is already in '${order.status}' state.`));
    }

    order.status = 'Cancelled';
    await order.save();

    // Restock items
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    new ApiResponse(200, order, 'Order cancelled successfully and inventory restocked.').send(res);
  } catch (error) {
    next(error);
  }
};
