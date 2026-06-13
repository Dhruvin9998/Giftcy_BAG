import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Collection from '../models/Collection.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Get all collections (database Collections, falling back to Categories with product counts)
 * @route   GET /api/v1/collections
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const dbCollections = await Collection.find();
    
    // If we have custom collections, return them with product counts
    if (dbCollections.length > 0) {
      const collectionsData = dbCollections.map((col) => ({
        _id: col._id,
        name: col.name,
        slug: col.slug,
        description: col.description || '',
        image: col.image || '',
        productCount: col.products ? col.products.length : 0,
      }));
      return res.json({
        success: true,
        data: { collections: collectionsData },
        message: 'Collections fetched successfully',
      });
    }

    // Otherwise fall back to categories as collections (legacy compatibility)
    const categories = await Category.find();
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
      message: 'Collections fetched successfully (legacy fallback)',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Get collection details & populated products list by slug
 * @route   GET /api/v1/collections/:slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const cleanSlug = (req.params.slug || '').trim();
    const collection = await Collection.findOne({ slug: cleanSlug }).populate('products');
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }
    res.json({
      success: true,
      data: collection,
      message: 'Collection details fetched successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Create a new collection
 * @route   POST /api/v1/collections
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, slug, description, image, products } = req.body;
    const collection = await Collection.create({ name, slug, description, image, products });
    
    // Maintain bidirectional references if products are specified
    if (Array.isArray(products) && products.length > 0) {
      await Product.updateMany(
        { _id: { $in: products } },
        { $addToSet: { collections: collection._id } }
      );
    }

    res.status(201).json({
      success: true,
      data: collection,
      message: 'Collection created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Update a collection
 * @route   PUT /api/v1/collections/:id
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, slug, description, image, products } = req.body;
    
    // Retrieve previous collection state to clear bidirectional references
    const oldCollection = await Collection.findById(req.params.id);
    if (!oldCollection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, image, products },
      { new: true, runValidators: true }
    );

    // Sync bidirectional product mapping
    await Product.updateMany(
      { collections: req.params.id },
      { $pull: { collections: req.params.id } }
    );
    if (Array.isArray(products) && products.length > 0) {
      await Product.updateMany(
        { _id: { $in: products } },
        { $addToSet: { collections: collection._id } }
      );
    }

    res.json({
      success: true,
      data: collection,
      message: 'Collection updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Delete a collection
 * @route   DELETE /api/v1/collections/:id
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      });
    }

    // Pull collection reference from all products
    await Product.updateMany(
      { collections: req.params.id },
      { $pull: { collections: req.params.id } }
    );

    res.json({
      success: true,
      data: null,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
