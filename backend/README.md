# Giftcy E-Commerce REST API Backend

This is a production-ready, highly secure, and optimized REST API backend built for the **Giftcy** e-commerce store. It is written in Node.js and Express.js, using MongoDB as the primary database with Mongoose ODM, and JWT for secure authentication.

---

## 🛠️ Technology Stack
- **Runtime Environment**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT & Google Sign-In (OAuth 2.0)
- **Payment Gateways**: Stripe Integration & Razorpay Integration
- **Security Tools**: Helmet (HTTP headers protection), Express Rate Limit (DDoS prevention), Express Mongo Sanitize (NoSQL injection prevention), XSS Clean (Cross-site scripting protection).
- **Communication Engines**: Nodemailer (SMTP template routing).

---

## 📂 Folder Structure
The backend implements a standard **MVC (Model-View-Controller)** pattern:
```
backend/
├── config/             # Database connection, SDK clients settings
├── controllers/        # Request handling logic (controllers)
├── middleware/         # Auth, validation, errors and security interceptors
├── models/             # Mongoose schemas definition (User, Product, etc.)
├── routes/             # Express API routing tables
├── services/           # Nodemailer and payments (Stripe/Razorpay) integrations
├── utils/              # Base Error handlers, standard JSON response builders
├── .env                # Local config credentials
├── .env.example        # Environment variables configuration guide
├── app.js              # Express app pipeline config
└── server.js           # Main bootstrap file
```

---

## 🚦 Getting Started (Local Setup)

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (either running locally or a MongoDB Atlas cloud URI)

### 2. Installation
Navigate into the backend directory and install the required packages:
```bash
cd backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the backend folder using the variables from `.env.example`:
```bash
cp .env.example .env
```
Populate the variables with your local database URI, JWT secret key, and SMTP/payment keys.

### 4. Running the Server
To launch in development mode with auto-reload (nodemon):
```bash
npm run dev
```
The server will boot up at: `http://localhost:5000`

---

## 📝 API Endpoint Documentation

All endpoints are prefixed with `/api/v1`.

### 🔑 Authentication (`/api/v1/auth`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **POST** | `/signup` | User signup. Generates verification code (OTP). | No |
| **POST** | `/verify-otp` | Verifies OTP code, activates user, returns JWT. | No |
| **POST** | `/login` | Authenticates email/password. Returns JWT. | No |
| **POST** | `/google-login` | Authenticated Google OAuth credentials token. | No |
| **POST** | `/forgot-password` | Emails reset URL with secure token. | No |
| **PUT** | `/reset-password/:token` | Takes token and new password, updates database. | No |
| **GET** | `/profile` | Retrieve current user profile details. | Yes (User) |
| **PUT** | `/profile` | Update current user name/email. | Yes (User) |

### 🛍️ Product Catalog (`/api/v1/products`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **GET** | `/` | Get all products with search, pagination, category & price filters. | No |
| **GET** | `/:idOrSlug` | Get product details by ID or Slug. | No |
| **POST** | `/` | Create a new product. | Yes (Admin) |
| **PUT** | `/:id` | Update an existing product. | Yes (Admin) |
| **DELETE** | `/:id` | Delete a product. | Yes (Admin) |

### 📁 Categories (`/api/v1/categories`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **GET** | `/` | Fetch all product categories. | No |
| **GET** | `/:id` | Fetch single category details. | No |
| **POST** | `/` | Create a new category. | Yes (Admin) |
| **PUT** | `/:id` | Update category details. | Yes (Admin) |
| **DELETE** | `/:id` | Delete category (checks that no products are attached). | Yes (Admin) |

### 🛒 Shopping Cart (`/api/v1/cart`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **GET** | `/` | Get authenticated user's cart. | Yes (User) |
| **POST** | `/` | Add item to cart (increments quantity if already exists). | Yes (User) |
| **PUT** | `/:productId` | Modify cart item quantity. | Yes (User) |
| **DELETE** | `/clear` | Clear all cart items. | Yes (User) |
| **DELETE** | `/:productId` | Remove a single product from cart. | Yes (User) |

### ❤️ Wishlist (`/api/v1/wishlist`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **GET** | `/` | Retrieve user wishlist items. | Yes (User) |
| **POST** | `/:productId` | Toggles product in/out of user wishlist. | Yes (User) |

### 📦 Orders (`/api/v1/orders`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **POST** | `/` | Create order. Deducts stock. Sets up Stripe/Razorpay if selected. | Yes (User) |
| **POST** | `/verify-razorpay` | Verify Razorpay payment signature & complete order. | Yes (User) |
| **GET** | `/my-orders` | Fetch authenticated user's purchase history. | Yes (User) |
| **GET** | `/:id` | Fetch order tracking status and details. | Yes (Owner/Admin) |
| **PUT** | `/:id/cancel` | Cancel order (restocks inventory). Allowed in Processing. | Yes (Owner/Admin) |
| **POST** | `/webhook/stripe` | Stripe webhook to capture successful payments. | No (Stripe Direct) |

### ⭐ Reviews (`/api/v1/reviews`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **GET** | `/:productId` | Fetch list of reviews for a specific product. | No |
| **POST** | `/:productId` | Review product. Requires verified purchase (delivered order). | Yes (User) |
| **DELETE** | `/:id` | Delete review (owner or admin). | Yes (Owner/Admin) |

### 🎟️ Coupon Promos (`/api/v1/coupons`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **GET** | `/validate/:code` | Check code validity, expiry date & min cart subtotal. | No |
| **GET** | `/` | List all coupons. | Yes (Admin) |
| **POST** | `/` | Create new coupon. | Yes (Admin) |
| **PUT** | `/:id/toggle` | Toggles active/inactive coupon state. | Yes (Admin) |
| **DELETE** | `/:id` | Delete coupon. | Yes (Admin) |

### 👑 Admin Utilities (`/api/v1/admin`)
| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **GET** | `/dashboard` | Retrieve statistics (total sales, users, orders, low stocks). | Yes (Admin) |
| **GET** | `/users` | List all registered users. | Yes (Admin) |
| **PUT** | `/users/:id` | Update user role (e.g. Demote/Promote). | Yes (Admin) |
| **DELETE** | `/users/:id` | Delete user account. | Yes (Admin) |
| **GET** | `/orders` | List all store customer orders. | Yes (Admin) |
| **PUT** | `/orders/:id/status` | Adjust order processing status (Processing, Shipped, Delivered). | Yes (Admin) |

---

## 🔑 Google OAuth 2.0 Setup Guide
To enable Google Sign-In:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Set the **Application type** to *Web application*.
6. Add Authorized JavaScript origins:
   - For local development: `http://localhost:5173` (your Vite frontend dev port)
7. Click **Create** to receive your `Client ID` and `Client Secret`.
8. Copy these values into your backend `.env` file under `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## 🔌 Frontend Connection Guide

Your existing frontend (built on TanStack Router / Vite) is currently communicating with Supabase. To switch over to this secure Node.js REST API backend:

### 1. Configure Axios or Fetch Client
Create an API configuration module in your frontend (e.g., `src/lib/api.ts`):
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial for storing JWT cookies securely
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token header if using localStorage instead of HttpOnly cookies
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Refactor Authentication Context
Replace the Supabase auth calls in `src/components/AuthContext.tsx` with axios REST requests:
```typescript
// Register/Signup
const signUp = async (name, email, password) => {
  const { data } = await api.post('/auth/signup', { name, email, password });
  return data;
};

// Login
const signIn = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.data.token); // Store jwt token
  return data;
};
```

---

## 🚀 Deployment Guide

### Option 1: VPS (e.g., DigitalOcean, AWS EC2, Linode)
1. **Prepare Server**: Install Node.js, MongoDB, and Nginx.
2. **Clone & Install**: Clone repository, run `npm install`.
3. **PM2 Process Manager**:
   Install PM2 to run your node application in the background:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "giftcy-backend"
   pm2 startup
   pm2 save
   ```
4. **Nginx Reverse Proxy**:
   Configure Nginx config file (`/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
5. **SSL (HTTPS)**: Run `certbot` for secure SSL certificates setup:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Option 2: Render
1. Create a **Web Service** on Render dashboard.
2. Connect your GitHub repository.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In the **Environment** tab, add all environment variables defined in `.env.example`.
5. Under Render dashboard, deploy a separate **Render MongoDB database** instance or connect your **MongoDB Atlas** cluster URI.

### Option 3: Railway
1. Click **New Project** on Railway dashboard.
2. Select **Deploy from GitHub repo** and select your repository.
3. Add a plugin: Select **MongoDB** to spin up a managed database instance automatically.
4. Railway will auto-inject the `MONGODB_URL` variable. Link it to `MONGODB_URI` in Railway Variables tab.
5. Add other `.env` parameters under the Variables settings.
6. The app will be deployed automatically and generate an HTTPS URL.
