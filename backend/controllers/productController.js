import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

// =========================================================================
// PRODUCT CONTROLLERS
// =========================================================================

/**
 * @desc    Get all products with advanced filtering, search, sorting and pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      isFeatured,
      isBestSeller,
      isNewArrival,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Full-text Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Category Filter (can match category ID or Category slug)
    if (category) {
      const foundCategory = await Category.findOne({
        $or: [
          { slug: category },
          { name: { $regex: category, $options: 'i' } },
          { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
        ].filter(Boolean),
      });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        // If category parameter exists but category is not found, return empty set
        return new ApiResponse(200, { products: [], total: 0, pages: 0 }, 'Products fetched').send(res);
      }
    }

    // 3. Price Range Filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // 4. Feature Flags
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (isBestSeller !== undefined) query.isBestSeller = isBestSeller === 'true';
    if (isNewArrival !== undefined) query.isNewArrival = isNewArrival === 'true';

    // 5. Sorting Options
    let sort = '-createdAt'; // Default sorting: newest
    if (sortBy) {
      if (sortBy === 'priceAsc') sort = 'price';
      else if (sortBy === 'priceDesc') sort = '-price';
      else if (sortBy === 'rating') sort = '-ratings';
      else if (sortBy === 'oldest') sort = 'createdAt';
    }

    // 6. Pagination Calculations
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    new ApiResponse(
      200,
      {
        products,
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      },
      'Products fetched successfully.'
    ).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by Slug or ID
 * @route   GET /api/v1/products/:idOrSlug
 * @access  Public
 */
export const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const product = await Product.findOne(query).populate('category', 'name slug');

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    new ApiResponse(200, product, 'Product fetched successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const { category } = req.body;

    // Verify Category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(new ApiError(404, 'Selected category does not exist'));
    }

    const product = await Product.create(req.body);
    new ApiResponse(201, product, 'Product created successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Verify Category exists if it is being updated
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return next(new ApiError(404, 'Selected category does not exist'));
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    new ApiResponse(200, product, 'Product updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    await Product.findByIdAndDelete(req.params.id);
    new ApiResponse(200, null, 'Product deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};


// =========================================================================
// CATEGORY CONTROLLERS
// =========================================================================

/**
 * @desc    Get all product categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    new ApiResponse(200, categories, 'Categories fetched successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    new ApiResponse(200, category, 'Category fetched successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return next(new ApiError(400, 'Please provide category name'));
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return next(new ApiError(400, 'Category with this name already exists'));
    }

    const category = await Category.create({ name, image });
    new ApiResponse(201, category, 'Category created successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    if (name) {
      // Check if duplicate name
      const duplicate = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (duplicate) {
        return next(new ApiError(400, 'Category with this name already exists'));
      }
      category.name = name;
      category.slug = undefined; // Force recalculation in model pre-save validate hooks
    }

    if (image !== undefined) {
      category.image = image;
    }

    await category.save();

    new ApiResponse(200, category, 'Category updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Check if there are any products attached to this category before deleting
    const linkedProducts = await Product.countDocuments({ category: category._id });
    if (linkedProducts > 0) {
      return next(new ApiError(400, `Cannot delete category. There are ${linkedProducts} products assigned to it.`));
    }

    await Category.findByIdAndDelete(req.params.id);
    new ApiResponse(200, null, 'Category deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};
