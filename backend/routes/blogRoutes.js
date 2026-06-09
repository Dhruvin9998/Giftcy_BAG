import express from 'express';
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/:slug', getBlogBySlug);

// Admin-protected routes
router.use(protect);
router.use(authorize('admin'));
router.post('/', createBlog);
router.route('/:id')
  .put(updateBlog)
  .delete(deleteBlog);

export default router;
