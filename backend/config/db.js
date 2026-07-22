import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import Collection from '../models/Collection.js';
import { setupMockDb } from './mockDbSetup.js';
import bcrypt from 'bcryptjs';
import dns from 'dns';

const seedData = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    let activeCategories;
    if (categoryCount === 0) {
      console.log('Seeding initial categories...');
      const categories = [
        { name: 'Potli Bags', slug: 'potli-bags' },
        { name: 'Wedding Gift Bags', slug: 'wedding-gift-bags' },
        { name: 'Return Gift Bags', slug: 'return-gift-bags' },
        { name: 'Custom Printed Bags', slug: 'custom-printed-bags' },
      ];
      activeCategories = await Category.insertMany(categories);
    } else {
      activeCategories = await Category.find();
    }

    if (activeCategories.length > 0) {
      console.log('Checking and seeding missing initial products...');
      const getCatId = (name) => {
        const found = activeCategories.find((c) => c.name === name);
        if (found) return found._id;

        // Fallbacks for polished names
        if (name === 'Wedding Gift Bags') {
          const polished = activeCategories.find((c) => c.slug === 'silk-satin-pouches');
          if (polished) return polished._id;
        }
        if (name === 'Return Gift Bags') {
          const polished = activeCategories.find((c) => c.slug === 'velvet-bags');
          if (polished) return polished._id;
        }
        if (name === 'Custom Printed Bags') {
          const polished = activeCategories.find((c) => c.slug === 'jute-linen-totes');
          if (polished) return polished._id;
        }

        return activeCategories[0]?._id;
      };

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

      let seededCount = 0;
      for (const p of products) {
        const exists = await Product.findOne({ slug: p.slug });
        if (!exists) {
          await Product.create(p);
          console.log(`[Database Seeder] Successfully seeded missing product: ${p.name}`);
          seededCount++;
        }
      }
      if (seededCount > 0) {
        console.log(`[Database Seeder] Successfully seeded ${seededCount} missing products.`);
      } else {
        console.log('[Database Seeder] No missing products to seed.');
      }
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
        },
        {
          key: "pincode_settings",
          value: {
            mode: "blacklist",
            pincodes: "7, 8"
          }
        },
        {
          key: "homepage_marquee",
          value: [
            "Free Shipping ₹999+",
            "Reusable Fabric",
            "Made in India",
            "Bulk Pricing",
            "Custom Printing"
          ]
        },
        {
          key: "homepage_wedding_promo",
          value: {
            title: "Perfect for Your Big Day",
            description: "From shagun envelopes to trousseau packaging, our wedding collection transforms every moment of your celebration into a luxurious experience. Custom monograms, matching colours, and bulk pricing available.",
            image: "",
            ctaText: "Explore Wedding Collection"
          }
        }
      ];
      await Settings.insertMany(defaultSettings);
      console.log('Site CMS settings successfully seeded.');
    }

    const adminExists = await User.findOne({ email: 'admin@giftcy.com' });
    if (!adminExists) {
      console.log('Seeding initial admin user...');
      await User.create({
        name: 'Admin User',
        email: 'admin@giftcy.com',
        password: 'admin@123',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user successfully seeded.');
    }

    // Ensure only admin@giftcy.com is permitted to have the admin role, demoting any other admins to standard users
    const demoteRes = await User.updateMany(
      { email: { $ne: 'admin@giftcy.com' }, role: 'admin' },
      { $set: { role: 'user' } }
    );
    if (demoteRes.modifiedCount > 0) {
      console.log(`[Admin Access Safeguard] Safely demoted ${demoteRes.modifiedCount} unauthorized admin accounts to regular users.`);
    }

    // Automatically repair/hash any plain-text passwords stored in the database
    const usersWithPassword = await User.find().select('+password');
    for (const u of usersWithPassword) {
      if (u.password && (!u.password.startsWith('$2') || u.password.length !== 60)) {
        console.log(`Detected plain-text password for ${u.email}. Hashing...`);
        const salt = await bcrypt.genSalt(10);
        u.password = await bcrypt.hash(u.password, salt);
        await u.save();
        console.log(`Password successfully hashed and secured for ${u.email}.`);
      }
    }

    // Check if the old "Potli Bags" collection exists or if there are no collections
    const hasOldCollection = await Collection.findOne({ name: 'Potli Bags' });
    const collectionsCount = await Collection.countDocuments();

    if (hasOldCollection || collectionsCount === 0) {
      console.log('Detected old or empty occasion collections. Migrating to Wedding, Festive, Return Gifts, and Birthday...');

      // Delete old collections
      await Collection.deleteMany({});

      const weddingCol = await Collection.create({
        name: 'Wedding',
        slug: 'wedding-gift-bags',
        description: 'Premium drawstring potlis and shagun envelopes for wedding guest favors.',
        image: ''
      });

      const festiveCol = await Collection.create({
        name: 'Festive',
        slug: 'festive-bags',
        description: 'Vibrant silk and brocade gift pouches for Diwali, Eid, and sangeet packaging.',
        image: ''
      });

      const returnCol = await Collection.create({
        name: 'Return Gifts',
        slug: 'return-gift-bags',
        description: 'Elegant reusable favor bags and carry bags for returning guest tokens.',
        image: ''
      });

      const birthdayCol = await Collection.create({
        name: 'Birthday',
        slug: 'birthday',
        description: 'Delicate pastel fabric pouches and boxes for birthday party favors.',
        image: ''
      });

      console.log('Seeded new occasion collections successfully.');

      // Clear all product collection assignments first
      await Product.updateMany({}, { collections: [] });

      // Link products to the new collections
      // Wedding collection products
      await Product.updateMany(
        { name: { $in: ['Ivory Silk Potli', 'Maroon Velvet Potli', 'Pearl White Envelope Bag'] } },
        { $addToSet: { collections: weddingCol._id } }
      );

      // Festive collection products
      await Product.updateMany(
        { name: { $in: ['Maroon Velvet Potli', 'Festive Brocade Box Bag'] } },
        { $addToSet: { collections: festiveCol._id } }
      );

      // Return Gifts collection products
      await Product.updateMany(
        { name: { $in: ['Blush Tassel Pouch', 'Festive Brocade Box Bag', 'Eco Jute Gift Sack'] } },
        { $addToSet: { collections: returnCol._id } }
      );

      // Birthday collection products
      await Product.updateMany(
        { name: { $in: ['Blush Tassel Pouch'] } },
        { $addToSet: { collections: birthdayCol._id } }
      );

      console.log('Successfully linked products to collections.');
    }

    // Clean up category slugs in the database (replaces spaces with hyphens)
    console.log('Sanitizing category slugs...');
    const allCategories = await Category.find();
    for (const cat of allCategories) {
      if (cat.slug.includes(' ')) {
        const cleanSlug = cat.slug.replace(/\s+/g, '-');
        console.log(`Fixing category slug: "${cat.slug}" -> "${cleanSlug}"`);
        cat.slug = cleanSlug;
        await cat.save();
      }
    }
    console.log('Category slugs successfully sanitized.');

    // Rename categories to represent actual physical product categories instead of duplicate occasions
    console.log('Polishing category names...');

    const weddingCat = await Category.findOne({ name: { $regex: /Wedding Gift Bags/i } });
    if (weddingCat) {
      weddingCat.name = 'Silk & Satin Pouches';
      weddingCat.slug = 'silk-satin-pouches';
      await weddingCat.save();
      console.log('Polished "Wedding Gift Bags" category name to "Silk & Satin Pouches".');
    }

    const returnCat = await Category.findOne({ name: { $regex: /Return Gift Bags/i } });
    if (returnCat) {
      returnCat.name = 'Velvet Bags';
      returnCat.slug = 'velvet-bags';
      await returnCat.save();
      console.log('Polished "Return Gift Bags" category name to "Velvet Bags".');
    }

    const customCat = await Category.findOne({ name: { $regex: /Custom Printed Bags/i } });
    if (customCat) {
      customCat.name = 'Jute & Linen Totes';
      customCat.slug = 'jute-linen-totes';
      await customCat.save();
      console.log('Polished "Custom Printed Bags" category name to "Jute & Linen Totes".');
    }
    // Migrate existing products with priority 0 to default high priority 99999
    const migratePriorityCount = await Product.updateMany(
      { priority: 0 },
      { $set: { priority: 99999 } }
    );
    if (migratePriorityCount.modifiedCount > 0) {
      console.log(`[Database Migration] Migrated ${migratePriorityCount.modifiedCount} products to priority 99999`);
    }
    console.log('Category names successfully polished.');
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
  }
};

const connectDB = async () => {
  console.log('[Database] Connecting to MongoDB using MONGODB_URI...');

  // Set DNS servers to Google DNS to bypass router/ISP SRV lookup blocks
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (dnsErr) {
    console.warn('Could not set custom DNS servers:', dnsErr.message);
  }

  // Listen for runtime connection errors or disconnections
  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection runtime error: ${err.message}`);
    console.log('Automatically falling back to in-memory mock database to prevent downtime.');
    setupMockDb();
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected from MongoDB. Falling back to in-memory mock database...');
    setupMockDb();
  });

  try {
    // Disable command buffering to prevent hanging queries on network disconnects
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    await seedData();
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed! Error: ${error.message}`);
    console.warn('⚠️  TIP: This error typically means your current IP address is not whitelisted in MongoDB Atlas.');
    console.warn('   Please go to cloud.mongodb.com -> Security -> Network Access and add your current IP address.');
    setupMockDb();
  }
};

export default connectDB;

