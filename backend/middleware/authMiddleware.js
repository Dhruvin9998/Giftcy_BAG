import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';

// Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Read token from Authorization Header or Cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized to access this resource. Token missing.'));
    }

    // 2. Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user associated with this token (excluding password)
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError(401, 'User associated with this token no longer exists.'));
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Not authorized to access this resource. Token is invalid.'));
  }
};

// Restrict routes to specific user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Dynamic Safeguard: demote and save if user is admin but email is not admin@giftcy.com
    if (req.user && req.user.role === 'admin' && req.user.email !== 'admin@giftcy.com') {
      console.warn(`[Security Alert] Non-exclusive admin access attempt by ${req.user.email}. Auto-demoting user to standard 'user' role.`);
      req.user.role = 'user';
      req.user.save().catch((err) => console.error('Failed to save demoted user role:', err.message));
    }

    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
        )
      );
    }
    next();
  };
};

// Optional protect - Decode token if present, but do not error if missing/invalid
export const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore error, proceed as guest
  }
  next();
};
