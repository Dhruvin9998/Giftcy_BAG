import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be positive'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price must be positive'],
      default: 0,
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a product category'],
    },
    stock: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    bulkPrice: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      default: '',
    },
    lowStockAlert: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Published',
    },
    colors: {
      type: [String],
      default: ['Ivory', 'Gold', 'Blush', 'Red', 'Green'],
    },
    sizes: {
      type: [String],
      default: ['Small', 'Medium', 'Large'],
    },
    packQuantities: {
      type: [Number],
      default: [1, 5, 10, 25, 50, 100],
    },
    specifications: {
      fabric: { type: String, default: 'Cotton-Blend' },
      dimensions: { type: String, default: '10 x 12 inch' },
      weight: { type: String, default: '120g' },
      handle: { type: String, default: 'Cotton Rope' },
      care: { type: String, default: 'Hand Wash Only' },
    },
    video: {
      type: String,
      default: '',
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name if not present or changed
productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, '') // Trim - from end
      + '-' + Math.floor(1000 + Math.random() * 9000); // Add random 4-digit code to avoid collision
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
