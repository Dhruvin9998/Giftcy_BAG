import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js';
import Blog from '../models/Blog.js';
import Banner from '../models/Banner.js';
import BulkInquiry from '../models/BulkInquiry.js';
import Collection from '../models/Collection.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const setupMockDb = () => {
  console.log('--------------------------------------------------');
  console.log('WARNING: MongoDB is not running on 127.0.0.1:27017.');
  console.log('Initializing IN-MEMORY MOCK DATABASE fallback mode...');
  console.log('All changes will be saved in-memory and reset on server restart.');
  console.log('You can register users and login. Admin credentials initialized as:');
  console.log('Email: admin@giftcy.com | Password: adminpassword');
  console.log('--------------------------------------------------');

  const memDb = {
    Category: [],
    Product: [],
    User: [],
    Order: [],
    Coupon: [],
    Cart: [],
    Review: [],
    Settings: [],
    Blog: [],
    Banner: [],
    BulkInquiry: [],
    Collection: []
  };

  // Helper to convert queries
  const matchQuery = (item, query) => {
    if (!query) return true;
    for (const key of Object.keys(query)) {
      if (key === '$or') {
        const matchesOr = query.$or.some(q => matchQuery(item, q));
        if (!matchesOr) return false;
        continue;
      }
      
      const itemVal = item[key];
      const queryVal = query[key];
      
      if (queryVal && typeof queryVal === 'object') {
        if (queryVal.$regex) {
          const regex = new RegExp(queryVal.$regex, queryVal.$options || 'i');
          if (!regex.test(itemVal || '')) return false;
          continue;
        }
        if (queryVal.$gte !== undefined) {
          if (!(Number(itemVal) >= Number(queryVal.$gte))) return false;
          continue;
        }
        if (queryVal.$lte !== undefined) {
          if (!(Number(itemVal) <= Number(queryVal.$lte))) return false;
          continue;
        }
        if (queryVal.$ne !== undefined) {
          if (String(itemVal) === String(queryVal.$ne)) return false;
          continue;
        }
        if (queryVal.$or) {
          const matchesNestedOr = queryVal.$or.some(q => matchQuery({ [key]: itemVal }, { [key]: q }));
          if (!matchesNestedOr) return false;
          continue;
        }
      } else {
        if (String(itemVal) !== String(queryVal)) return false;
      }
    }
    return true;
  };

  const makeDoc = (modelName, data) => {
    if (!data) return null;
    const doc = {
      ...data,
      _id: data._id || new mongoose.Types.ObjectId(),
      id: data._id || data.id,
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
      save: async function() {
        const idx = memDb[modelName].findIndex(x => String(x._id) === String(this._id));
        const cleanData = { ...this };
        delete cleanData.save;
        delete cleanData.comparePassword;
        delete cleanData.isValid;
        if (idx >= 0) {
          memDb[modelName][idx] = cleanData;
        } else {
          memDb[modelName].push(cleanData);
        }
        return this;
      }
    };
    if (modelName === 'User') {
      doc.comparePassword = async function(cand) {
        if (this.password && this.password.startsWith('$2')) {
          return await bcrypt.compare(cand, this.password);
        }
        return cand === this.password;
      };
    }
    if (modelName === 'Coupon') {
      doc.isValid = function(subtotal) {
        if (!this.active) return false;
        if (this.expiryDate && new Date() > new Date(this.expiryDate)) return false;
        if (Number(subtotal) < this.minCartAmount) return false;
        return true;
      };
    }
    return doc;
  };

  // Seed default data if empty
  const seedDefaultData = () => {
    // 1. Categories
    const potli = makeDoc('Category', { name: 'Potli Bags', slug: 'potli-bags' });
    const wedding = makeDoc('Category', { name: 'Wedding Gift Bags', slug: 'wedding-gift-bags' });
    const ret = makeDoc('Category', { name: 'Return Gift Bags', slug: 'return-gift-bags' });
    const custom = makeDoc('Category', { name: 'Custom Printed Bags', slug: 'custom-printed-bags' });
    
    memDb.Category.push(potli, wedding, ret, custom);

    // 2. Products
    const products = [
      {
        name: 'Ivory Silk Potli',
        slug: 'ivory-silk-potli',
        description: 'Handcrafted ivory silk potli with a satin drawstring. Reusable, premium fabric — designed for weddings, return gifts, and luxury packaging.',
        price: 249,
        compareAtPrice: 349,
        images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=60'],
        category: potli._id,
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
        category: wedding._id,
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
        category: ret._id,
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
        category: custom._id,
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
        category: potli._id,
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
        category: wedding._id,
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
        category: ret._id,
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
        category: custom._id,
        stock: 200,
        isBestSeller: true,
      },
    ];

    products.forEach(p => memDb.Product.push(makeDoc('Product', p)));

    // 3. Admin User
    const admin = makeDoc('User', {
      name: 'Admin User',
      email: 'admin@giftcy.com',
      password: 'adminpassword',
      role: 'admin',
      isVerified: true
    });
    memDb.User.push(admin);

    // 4. Coupon
    const coupon = makeDoc('Coupon', {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountAmount: 10,
      minCartAmount: 100,
      active: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    memDb.Coupon.push(coupon);

    // 5. Settings
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

    defaultSettings.forEach(s => memDb.Settings.push(makeDoc('Settings', s)));

    // 6. Banners
    const defaultBanners = [
      {
        title: "Wedding Collection 2026",
        subtitle: "Luxury Drawstring Potli Bags",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600",
        ctaText: "Shop Now",
        ctaLink: "/shop?category=wedding-gift-bags",
        active: true
      }
    ];
    defaultBanners.forEach(b => memDb.Banner.push(makeDoc('Banner', b)));

    // 7. Blogs
    const defaultBlogs = [
      {
        title: "The Ultimate Guide to Sustainable Luxury Gifting",
        slug: "sustainable-gifting-guide",
        excerpt: "Discover how to balance opulence with eco-consciousness. A guide to making your gift wrap as premium and reusable as the gift itself.",
        content: `Gifting is an ancient art in India, representing honor, connection, and celebration. However, as festivals and wedding seasons roll by, the volume of waste generated by single-use wrapping paper and plastic laminates spikes dramatically.\n\nAt Giftcy, we believe luxury and sustainability are not mutually exclusive. In fact, true luxury lies in longevity, craft, and respect for our environment. Here’s how you can make your celebrations sustainable without compromising on aesthetics.`,
        featuredImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
        metaTitle: "Sustainable Luxury Gifting Guide — Giftcy",
        metaDescription: "Make your gift wrap premium and reusable.",
        author: "Aditi Sharma",
        published: true
      },
      {
        title: "Preserving Heritage: At Home with India's Master Karigars",
        slug: "heritage-weaves-indian-karigars",
        excerpt: "Step behind the scenes into the artisanal workshops of Gujarat and Rajasthan, where every thread tells a story of heritage and craft.",
        content: `Behind every Giftcy bag is the steady hand of a master artisan. In the vibrant clusters of Jaipur and Ahmedabad, our karigars preserve techniques passed down through generations.\n\nFrom delicate Gota-Patti embroidery to the gold-zari weaving of Banarasi brocades, these fabrics carry India’s rich textile heritage.`,
        featuredImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
        metaTitle: "India's Master Karigars — Giftcy Heritage",
        metaDescription: "Go behind the scenes of our artisanal production.",
        author: "Rohan Verma",
        published: true
      }
    ];
    defaultBlogs.forEach(b => memDb.Blog.push(makeDoc('Blog', b)));

    // 8. Bulk Inquiries
    const defaultInquiries = [
      {
        name: "Rahul Khanna",
        mobile: "9876543210",
        email: "rahul@khannaweddings.com",
        companyName: "Khanna Wedding Planners",
        inquiryType: "Wedding",
        quantity: 150,
        message: "Need custom gold embroidered potli bags for guest favors.",
        logoUrl: "",
        status: "New"
      }
    ];
    defaultInquiries.forEach(i => memDb.BulkInquiry.push(makeDoc('BulkInquiry', i)));
  };

  seedDefaultData();

  // Generic Mock Model Setup
  const mockModel = (ModelClass, modelName) => {
    const performPopulate = (doc) => {
      if (!doc) return;
      if (doc.category && typeof doc.category !== 'object') {
        const cat = memDb.Category.find(c => String(c._id) === String(doc.category));
        if (cat) doc.category = cat;
      }
      if (doc.user && typeof doc.user !== 'object') {
        const u = memDb.User.find(x => String(x._id) === String(doc.user));
        if (u) doc.user = u;
      }
      if (modelName === 'Collection') {
        doc.products = memDb.Product.filter(p => p.collections && p.collections.some(cid => String(cid) === String(doc._id)));
      }
    };

    ModelClass.find = function(query = {}) {
      const items = memDb[modelName].filter(item => matchQuery(item, query));
      const docs = items.map(item => makeDoc(modelName, item));
      
      const queryBuilder = {
        populate: function() {
          docs.forEach(performPopulate);
          return this;
        },
        sort: function() { return this; },
        skip: function() { return this; },
        limit: function() { return this; },
        select: function() { return this; },
        then: function(resolve) { return Promise.resolve(resolve(docs)); },
        catch: function(reject) { return Promise.reject(reject); }
      };
      return queryBuilder;
    };

    ModelClass.findOne = function(query = {}) {
      const item = memDb[modelName].find(item => matchQuery(item, query));
      const doc = makeDoc(modelName, item);
      const queryBuilder = {
        populate: function() {
          performPopulate(doc);
          return this;
        },
        select: function() { return this; },
        then: function(resolve) { return Promise.resolve(resolve(doc)); }
      };
      return doc ? queryBuilder : { then: (resolve) => Promise.resolve(resolve(null)) };
    };

    ModelClass.findById = function(id) {
      const item = memDb[modelName].find(x => String(x._id) === String(id));
      const doc = makeDoc(modelName, item);
      const queryBuilder = {
        populate: function() {
          performPopulate(doc);
          return this;
        },
        then: function(resolve) { return Promise.resolve(resolve(doc)); }
      };
      return doc ? queryBuilder : { then: (resolve) => Promise.resolve(resolve(null)) };
    };

    ModelClass.create = async (data) => {
      const arrayData = Array.isArray(data) ? data : [data];
      const createdDocs = [];
      for (const item of arrayData) {
        const doc = makeDoc(modelName, item);
        const cleanData = { ...doc };
        delete cleanData.save;
        delete cleanData.comparePassword;
        delete cleanData.isValid;
        memDb[modelName].push(cleanData);
        createdDocs.push(doc);
      }
      return Array.isArray(data) ? createdDocs : createdDocs[0];
    };

    ModelClass.countDocuments = async (query = {}) => {
      return memDb[modelName].filter(item => matchQuery(item, query)).length;
    };

    ModelClass.findByIdAndUpdate = async (id, update, options = {}) => {
      const idx = memDb[modelName].findIndex(x => String(x._id) === String(id));
      if (idx === -1) return null;
      
      const current = memDb[modelName][idx];
      let updated = { ...current };
      if (update.$inc) {
        for (const k of Object.keys(update.$inc)) {
          updated[k] = (updated[k] || 0) + update.$inc[k];
        }
      }
      updated = { ...updated, ...update };
      delete updated.$inc;
      
      memDb[modelName][idx] = updated;
      return makeDoc(modelName, updated);
    };

    ModelClass.findByIdAndDelete = async (id) => {
      const idx = memDb[modelName].findIndex(x => String(x._id) === String(id));
      if (idx === -1) return null;
      const deleted = memDb[modelName][idx];
      memDb[modelName].splice(idx, 1);
      return makeDoc(modelName, deleted);
    };

    ModelClass.aggregate = async (pipeline) => {
      if (modelName === 'Order') {
        const paidOrders = memDb.Order.filter(o => o.isPaid || (o.paymentMethod === 'COD' && o.status !== 'Cancelled'));
        const totalSales = paidOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        return [{ _id: null, totalSales }];
      }
      return [];
    };

    ModelClass.updateMany = async (query = {}, update = {}, options = {}) => {
      const items = memDb[modelName].filter(item => matchQuery(item, query));
      for (const item of items) {
        const idx = memDb[modelName].findIndex(x => String(x._id) === String(item._id));
        if (idx !== -1) {
          let updated = { ...memDb[modelName][idx] };
          
          if (update.$addToSet) {
            for (const key of Object.keys(update.$addToSet)) {
              const val = update.$addToSet[key];
              if (!Array.isArray(updated[key])) {
                updated[key] = updated[key] ? [updated[key]] : [];
              }
              if (!updated[key].some(x => String(x) === String(val))) {
                updated[key].push(val);
              }
            }
          }
          if (update.$pull) {
            for (const key of Object.keys(update.$pull)) {
              const val = update.$pull[key];
              if (Array.isArray(updated[key])) {
                updated[key] = updated[key].filter(x => String(x) !== String(val));
              }
            }
          }
          
          // apply other normal updates
          const cleanUpdate = { ...update };
          delete cleanUpdate.$addToSet;
          delete cleanUpdate.$pull;
          updated = { ...updated, ...cleanUpdate };
          
          memDb[modelName][idx] = updated;
        }
      }
      return { nModified: items.length };
    };
  };

  mockModel(Product, 'Product');
  mockModel(Category, 'Category');
  mockModel(User, 'User');
  mockModel(Order, 'Order');
  mockModel(Coupon, 'Coupon');
  mockModel(Cart, 'Cart');
  mockModel(Review, 'Review');
  mockModel(Settings, 'Settings');
  mockModel(Blog, 'Blog');
  mockModel(Banner, 'Banner');
  mockModel(BulkInquiry, 'BulkInquiry');
  mockModel(Collection, 'Collection');
};
