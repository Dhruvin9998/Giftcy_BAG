import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * @desc    Get Admin dashboard statistics
 * @route   GET /api/v1/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Sales (from Paid orders or Cash on Delivery orders)
    const salesData = await Order.aggregate([
      {
        $match: {
          $or: [
            { isPaid: true },
            { paymentMethod: 'COD', status: { $ne: 'Cancelled' } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);

    // 2. Counts
    const ordersCount = await Order.countDocuments();
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const customersCount = await User.countDocuments({ role: 'user' });
    const pendingOrdersCount = await Order.countDocuments({ $or: [{ status: 'Pending' }, { status: 'Processing' }] });
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 10 } });
    
    // 3. Out of Stock items count
    const outOfStockCount = await Product.countDocuments({ stock: 0 });

    // 4. Sales by category aggregation
    const categorySales = await Order.aggregate([
      {
        $match: { isPaid: true },
      },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          salesAmount: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
          unitsSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 1,
          categoryName: '$categoryInfo.name',
          salesAmount: 1,
          unitsSold: 1,
        },
      },
    ]);

    // 5. Recent 5 Orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(5);

    new ApiResponse(
      200,
      {
        stats: {
          totalSales: Math.round(totalSales * 100) / 100,
          ordersCount,
          usersCount,
          productsCount,
          customersCount,
          pendingOrdersCount,
          lowStockCount,
          outOfStockCount,
        },
        categorySales,
        recentOrders,
      },
      'Dashboard stats compiled successfully.'
    ).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    new ApiResponse(200, users, 'Users retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return next(new ApiError(400, 'Please specify a valid role (user or admin)'));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Guard: Prevent admin from demoting themselves
    if (user._id.toString() === req.user.id && role === 'user') {
      return next(new ApiError(400, 'You cannot remove your own admin access privileges'));
    }

    user.role = role;
    await user.save();

    new ApiResponse(200, user, 'User role updated.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Guard: Prevent self deletion
    if (user._id.toString() === req.user.id) {
      return next(new ApiError(400, 'You cannot delete your own admin account'));
    }

    await User.findByIdAndDelete(req.params.id);
    new ApiResponse(200, null, 'User account deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders list (for order management panel)
 * @route   GET /api/v1/admin/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
    new ApiResponse(200, orders, 'All orders retrieved.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status & handle shipping transitions
 * @route   PUT /api/v1/admin/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return next(new ApiError(400, 'Invalid status selection'));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Handle Cancelled transition restock logic
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Handle stock re-decrement if transition is from Cancelled back to Processing
    if (order.status === 'Cancelled' && status !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // Paid update on Delivery for COD
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    order.status = status;
    await order.save();

    new ApiResponse(200, order, 'Order status updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit contact message
 * @route   POST /api/v1/contact
 * @access  Public
 */
export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new ApiError(400, 'All fields are required (name, email, subject, message)'));
    }

    console.log(`[Contact Form Received] Subject: ${subject} from ${name} (${email})`);
    
    // In production, you would send this to the business email via emailService.
    // For now we simulate.

    new ApiResponse(200, null, 'Message submitted successfully. We will get back to you shortly.').send(res);
  } catch (error) {
    next(error);
  }
};
