import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * @desc    Get all collections (categories with product counts)
 * @route   GET /api/v1/collections
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();

    // Get product counts for each category
    const collections = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image || '',
          productCount: count,
        };
      })
    );

    res.json({
      success: true,
      data: { collections },
      message: 'Collections fetched successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
