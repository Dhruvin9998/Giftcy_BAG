import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { setupMockDb } from './mockDbSetup.js';

const seedData = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding initial categories...');
      const categories = [
        { name: 'Potli Bags', slug: 'potli-bags' },
        { name: 'Wedding Gift Bags', slug: 'wedding-gift-bags' },
        { name: 'Return Gift Bags', slug: 'return-gift-bags' },
        { name: 'Custom Printed Bags', slug: 'custom-printed-bags' },
      ];
      const createdCategories = await Category.insertMany(categories);

      const getCatId = (name) => createdCategories.find((c) => c.name === name)._id;

      console.log('Seeding initial products...');
      const products = [
        {
          name: 'Ivory Silk Potli',
          slug: 'ivory-silk-potli',
          description: 'Handcrafted ivory silk potli with a satin drawstring. Reusable, premium fabric — designed for weddings, return gifts, and luxury packaging.',
          price: 249,
          compareAtPrice: 349,
          images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Potli Bags'),
          stock: 100,
          isBestSeller: true,
          isFeatured: true,
        },
        {
          name: 'Regal Gold Embroidered',
          slug: 'regal-gold-embroidered',
          description: 'An opulent gold-embroidered fabric bag with traditional motifs. Perfect for shagun, sangeet favors, and festive gifting.',
          price: 329,
          compareAtPrice: 449,
          images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Wedding Gift Bags'),
          stock: 100,
          isNewArrival: true,
          isFeatured: true,
        },
        {
          name: 'Blush Tassel Pouch',
          slug: 'blush-tassel-pouch',
          description: 'Soft blush fabric pouch finished with a hand-knotted gold tassel. A delicate, reusable favor for birthdays and intimate celebrations.',
          price: 179,
          compareAtPrice: 229,
          images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Return Gift Bags'),
          stock: 100,
          isFeatured: true,
        },
        {
          name: 'Monogram Linen Tote',
          slug: 'monogram-linen-tote',
          description: 'Premium linen tote with gold foil monogram. Ideal for corporate gifting, hampers, and bespoke wedding favors.',
          price: 299,
          compareAtPrice: 399,
          images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Custom Printed Bags'),
          stock: 100,
          isFeatured: true,
        },
      ];
      await Product.insertMany(products);
      console.log('Database successfully seeded with initial categories and products.');
    }
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedData();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    setupMockDb();
  }
};

export default connectDB;

