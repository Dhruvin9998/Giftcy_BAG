import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
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
        {
          name: 'Maroon Velvet Potli',
          slug: 'maroon-velvet-potli',
          description: 'Rich maroon velvet potli with gold thread embroidery and pearl detailing. A royal choice for sangeet and mehendi favors.',
          price: 289,
          compareAtPrice: 399,
          images: ['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Potli Bags'),
          stock: 80,
          isNewArrival: true,
        },
        {
          name: 'Pearl White Envelope Bag',
          slug: 'pearl-white-envelope',
          description: 'Minimalist pearl white shagun envelope bag in silk finish. Perfect for cash gifts, vouchers, and small jewelry at weddings.',
          price: 199,
          compareAtPrice: 279,
          images: ['https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Wedding Gift Bags'),
          stock: 120,
          isBestSeller: true,
        },
        {
          name: 'Festive Brocade Box Bag',
          slug: 'festive-brocade-box',
          description: 'Structured brocade box bag with a magnetic closure. Ideal for Diwali sweets, dry fruit hampers, and festive corporate gifting.',
          price: 349,
          compareAtPrice: 499,
          images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Return Gift Bags'),
          stock: 60,
          isNewArrival: true,
          isFeatured: true,
        },
        {
          name: 'Eco Jute Gift Sack',
          slug: 'eco-jute-gift-sack',
          description: 'Rustic jute gift sack with cotton lining and custom screen print option. Perfect for eco-conscious brands and sustainable gifting.',
          price: 149,
          compareAtPrice: 199,
          images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=60'],
          category: getCatId('Custom Printed Bags'),
          stock: 200,
          isBestSeller: true,
        },
      ];
      await Product.insertMany(products);
      console.log('Database successfully seeded with initial categories and products.');
    }

    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      console.log('Seeding initial site CMS settings...');
      const defaultSettings = [
        {
          key: "homepage_hero",
          value: {
            badge: "Festive Edit '26",
            title: "Make Every Gift Premium",
            description: "Reusable fabric gift bags, handcrafted in India for weddings, festivals, and life's most precious moments.",
            image: ""
          }
        },
        {
          key: "homepage_stats",
          value: [
            { value: "50k+", label: "Bags gifted" },
            { value: "100%", label: "Reusable" },
            { value: "4.9★", label: "Loved by" }
          ]
        },
        {
          key: "contact_info",
          value: {
            whatsapp: "+91 99999 99999",
            email: "hello@giftcy.in",
            phone: "+91 99999 99999",
            address: "Mumbai, India"
          }
        },
        {
          key: "about_page",
          value: {
            title: "Our Story",
            subtitle: "A gift is more than what's inside.",
            description: "Giftcy was born from a simple belief: the way we give matters as much as what we give. We craft reusable fabric bags that elevate every gesture — sustainable, premium, unforgettable.",
            philosophyHeading: "Beautifully reusable.",
            philosophyDesc: "India gifts more than any nation in the world. We believe that joy shouldn't end in a landfill. Every Giftcy bag replaces single-use paper and plastic with something the receiver will cherish, reuse, and remember.",
            craftHeading: "Made by hand, in India.",
            craftDesc: "We work with master karigars and women-led ateliers across Gujarat and Rajasthan, supporting traditional craft while building modern, premium products.",
            storyImage: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800",
            craftImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"
          }
        }
      ];
      await Settings.insertMany(defaultSettings);
      console.log('Site CMS settings successfully seeded.');
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

