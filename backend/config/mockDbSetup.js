import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import Review from '../models/Review.js';
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
    Review: []
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
  };

  seedDefaultData();

  // Generic Mock Model Setup
  const mockModel = (ModelClass, modelName) => {
    ModelClass.find = function(query = {}) {
      const items = memDb[modelName].filter(item => matchQuery(item, query));
      const docs = items.map(item => makeDoc(modelName, item));
      
      const queryBuilder = {
        populate: function() {
          docs.forEach(d => {
            if (d.category && typeof d.category !== 'object') {
              const cat = memDb.Category.find(c => String(c._id) === String(d.category));
              if (cat) d.category = cat;
            }
            if (d.user && typeof d.user !== 'object') {
              const u = memDb.User.find(x => String(x._id) === String(d.user));
              if (u) d.user = u;
            }
          });
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
          if (doc) {
            if (doc.category && typeof doc.category !== 'object') {
              const cat = memDb.Category.find(c => String(c._id) === String(doc.category));
              if (cat) doc.category = cat;
            }
            if (doc.user && typeof doc.user !== 'object') {
              const u = memDb.User.find(x => String(x._id) === String(doc.user));
              if (u) doc.user = u;
            }
          }
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
          if (doc) {
            if (doc.category && typeof doc.category !== 'object') {
              const cat = memDb.Category.find(c => String(c._id) === String(doc.category));
              if (cat) doc.category = cat;
            }
            if (doc.user && typeof doc.user !== 'object') {
              const u = memDb.User.find(x => String(x._id) === String(doc.user));
              if (u) doc.user = u;
            }
          }
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
  };

  mockModel(Product, 'Product');
  mockModel(Category, 'Category');
  mockModel(User, 'User');
  mockModel(Order, 'Order');
  mockModel(Coupon, 'Coupon');
  mockModel(Cart, 'Cart');
  mockModel(Review, 'Review');
};
