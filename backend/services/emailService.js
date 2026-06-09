import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email helper
const sendEmail = async (options) => {
  // If credentials are mock, skip sending email and just log it
  if (
    !process.env.SMTP_USER ||
    process.env.SMTP_USER === 'your_smtp_username_here' ||
    process.env.SMTP_USER === 'mockuser'
  ) {
    console.log('--- EMAIL SIMULATION ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text || 'HTML Content'}`);
    console.log('------------------------');
    return true;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId}`);
  return info;
};

// Send OTP verification email
export const sendOTPEmail = async (email, otp) => {
  const subject = 'Verify Your Giftcy Account - OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #d4a373; text-align: center;">Welcome to Giftcy!</h2>
      <p>Thank you for signing up. To complete your verification, please use the following OTP (One-Time Password):</p>
      <div style="background-color: #fefae0; padding: 15px; text-align: center; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #606c38; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 13px; color: #666;">This code is valid for 10 minutes. If you did not sign up for a Giftcy account, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; 2026 Giftcy Inc. All rights reserved.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text: `Your verification code is: ${otp}. This code is valid for 10 minutes.`,
  });
};

// Send Forgot Password Reset email
export const sendResetPasswordEmail = async (email, resetUrl) => {
  const subject = 'Giftcy Account Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #c1121f; text-align: center;">Reset Your Password</h2>
      <p>We received a request to reset the password associated with this email address. Please click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #d4a373; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If you cannot click the button above, copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #0077b6;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="font-size: 13px; color: #666;">This link is active for 10 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; 2026 Giftcy Inc. All rights reserved.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text: `To reset your password, please click the link: ${resetUrl}. This link is valid for 10 minutes.`,
  });
};

// Send Order Confirmation email
export const sendOrderConfirmationEmail = async (email, order) => {
  const subject = `Order Confirmed - #${order._id}`;

  const itemsHtml = order.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px; vertical-align: middle;"/>
        <span style="vertical-align: middle;">${item.name}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #606c38; text-align: center;">Thank You for Your Order!</h2>
      <p>Hi there,</p>
      <p>We are excited to let you know that your order has been received and is currently being processed. Here are your order details:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id}</p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p style="margin: 5px 0;"><strong>Delivery Status:</strong> ${order.status}</p>
      </div>

      <h3>Items Ordered:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #eee;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="width: 50%; margin-left: auto; text-align: right; line-height: 1.6;">
        <p style="margin: 5px 0;">Subtotal: $${order.itemsPrice.toFixed(2)}</p>
        ${order.discountPrice > 0 ? `<p style="margin: 5px 0; color: green;">Discount: -$${order.discountPrice.toFixed(2)}</p>` : ''}
        <p style="margin: 5px 0;">Shipping: $${order.shippingPrice.toFixed(2)}</p>
        <p style="margin: 5px 0;">Tax: $${order.taxPrice.toFixed(2)}</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 10px 0;"/>
        <p style="margin: 5px 0; font-size: 16px; font-weight: bold; color: #d4a373;">Total: $${order.totalPrice.toFixed(2)}</p>
      </div>

      <div style="margin-top: 30px; background-color: #fdf6e2; padding: 15px; border-radius: 6px; font-size: 13px;">
        <strong>Shipping Address:</strong><br/>
        ${order.shippingAddress.address}, ${order.shippingAddress.city},<br/>
        ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}<br/>
        Phone: ${order.shippingAddress.phone}
      </div>

      <p style="margin-top: 30px;">If you have any questions, feel free to contact us by responding to this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; 2026 Giftcy Inc. All rights reserved.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text: `Your order #${order._id} has been confirmed. Total is $${order.totalPrice.toFixed(2)}.`,
  });
};
