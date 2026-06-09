import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Stripe if secret key is present and not mock
const getStripeInstance = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Initialize Razorpay if keys are present and not mock
const getRazorpayInstance = () => {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID.includes('mock') ||
    !process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_KEY_SECRET.includes('mock')
  ) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Create Stripe Payment Intent
 * @param {number} amount - Amount in USD (or local currency subunits)
 * @param {string} currency - Currency code (e.g. 'usd')
 */
export const createStripePaymentIntent = async (amount, currency = 'usd') => {
  const stripeInstance = getStripeInstance();
  
  // Simulation fallback
  if (!stripeInstance) {
    console.log(`[Stripe Simulation] Creating payment intent of amount: ${amount} ${currency.toUpperCase()}`);
    return {
      id: `pi_mock_${crypto.randomBytes(8).toString('hex')}`,
      client_secret: `pi_mock_secret_${crypto.randomBytes(12).toString('hex')}`,
      status: 'requires_payment_method',
      amount,
    };
  }

  // Convert amount to cents/smallest currency unit (e.g. $10.00 -> 1000 cents)
  const amountInCents = Math.round(amount * 100);

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: amountInCents,
    currency,
    metadata: { integration_check: 'accept_a_payment' },
  });

  return paymentIntent;
};

/**
 * Create Razorpay Order
 * @param {number} amount - Amount in USD/INR
 * @param {string} currency - Currency code (e.g. 'INR')
 */
export const createRazorpayOrder = async (amount, currency = 'INR') => {
  const razorpayInstance = getRazorpayInstance();

  // Simulation fallback
  if (!razorpayInstance) {
    console.log(`[Razorpay Simulation] Creating order of amount: ${amount} ${currency}`);
    return {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'created',
    };
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay accepts in subunits (paise)
    currency,
    receipt: `receipt_${crypto.randomBytes(4).toString('hex')}`,
  };

  const order = await razorpayInstance.orders.create(options);
  return order;
};

/**
 * Verify Razorpay Signature
 * @param {string} razorpayOrderId 
 * @param {string} razorpayPaymentId 
 * @param {string} signature 
 */
export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  const razorpayInstance = getRazorpayInstance();

  if (!razorpayInstance) {
    // In mock/simulation mode, accept all signatures
    console.log('[Razorpay Simulation] Auto-verifying signature to true');
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
