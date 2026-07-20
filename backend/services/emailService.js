import nodemailer from 'nodemailer';

// Singleton pooled transporter for instant email dispatch
let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = port === 465;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure,
    pool: true, // Enable SMTP connection pooling for fast message dispatch
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return cachedTransporter;
};

// Send email helper
const sendEmail = async (options) => {
  // Only simulate if SMTP is truly not configured
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    process.env.SMTP_USER === 'your_smtp_username_here' ||
    process.env.SMTP_USER === 'your_gmail@gmail.com'
  ) {
    console.log('⚠️  SMTP not configured — EMAIL SIMULATION:');
    console.log(`   To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    if (options.text) console.log(`   Body: ${options.text}`);
    console.log('   → Configure SMTP_USER and SMTP_PASS in .env to send real emails.');
    return true;
  }

  const transporter = getTransporter();

  const mailOptions = {
    from: options.from || `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    replyTo: options.replyTo,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent: ${info.messageId}`);
  return info;
};

// Send OTP verification email
export const sendOTPEmail = async (email, otp) => {
  const subject = '🔐 Your Giftcy Verification Code';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f5f0; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #d4a373 0%, #c8956b 100%); padding: 40px 40px 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 2px;">GIFTCY</h1>
                  <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.85); letter-spacing: 1px;">LUXURY GIFTING</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 8px; font-size: 22px; color: #2d2a26; font-weight: 600;">Verify your email</h2>
                  <p style="margin: 0 0 28px; font-size: 14px; color: #6b6560; line-height: 1.6;">
                    Thank you for joining Giftcy! Enter this verification code to complete your registration:
                  </p>

                  <!-- OTP Code Box -->
                  <div style="background: linear-gradient(135deg, #fefae0 0%, #f5f0e0 100%); border: 2px dashed #d4a373; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 28px;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #2d2a26; font-family: 'Courier New', monospace;">${otp}</span>
                  </div>

                  <p style="margin: 0 0 6px; font-size: 13px; color: #9b9590;">
                    ⏱ This code expires in <strong style="color: #d4a373;">10 minutes</strong>.
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #9b9590;">
                    If you didn't create a Giftcy account, please ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #faf8f5; padding: 24px 40px; border-top: 1px solid #ebe6df; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #b5afa8;">&copy; 2026 Giftcy Inc. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text: `Your Giftcy verification code is: ${otp}. This code is valid for 10 minutes.`,
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

// Send Contact Form Notification email to admin
export const sendContactFormEmail = async (contact) => {
  const subject = `📩 New Customer Message: ${contact.subject}`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f5f0; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #d4a373 0%, #c8956b 100%); padding: 30px; text-align: center;">
                  <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">New Customer Message</h2>
                  <p style="margin: 6px 0 0; font-size: 11px; color: rgba(255,255,255,0.85); uppercase tracking-wider;">Customer Support Inquiry</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; text-align: left;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.6; color: #2d2a26;">
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold; width: 80px;">From:</td>
                      <td style="padding-bottom: 8px;">${contact.name}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Email:</td>
                      <td style="padding-bottom: 8px;"><a href="mailto:${contact.email}" style="color: #d4a373; text-decoration: none;">${contact.email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Phone:</td>
                      <td style="padding-bottom: 8px;">${contact.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 15px; font-weight: bold;">Subject:</td>
                      <td style="padding-bottom: 15px; font-weight: bold; color: #c8956b;">${contact.subject}</td>
                    </tr>
                  </table>

                  <!-- Message body block -->
                  <div style="background-color: #fcfbf9; border-left: 4px solid #d4a373; padding: 16px; border-radius: 8px; font-size: 14px; color: #4a4540; margin-top: 10px; line-height: 1.6; white-space: pre-wrap;">
${contact.message}
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #faf8f5; padding: 20px; border-top: 1px solid #ebe6df; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #b5afa8;">Submitted via Giftcy Gifting Concierge Contact form.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    from: `"${contact.name}" <${contact.email}>`,
    replyTo: contact.email,
    to: 'giftcybag1609@gmail.com',
    subject,
    html,
    text: `New customer message from ${contact.name} (${contact.email}). Phone: ${contact.phone || 'N/A'}. Subject: ${contact.subject}. Message: ${contact.message}`,
  });
};

// Send Bulk Inquiry email to admin
export const sendBulkInquiryEmail = async (inquiry) => {
  const subject = 'Bulk Inquiry';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f5f0; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #d4a373 0%, #c8956b 100%); padding: 30px; text-align: center;">
                  <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">New Bulk Inquiry</h2>
                  <p style="margin: 6px 0 0; font-size: 11px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 1px;">Wholesale B2B Order Details</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 30px; text-align: left;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.6; color: #2d2a26;">
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold; width: 120px;">From:</td>
                      <td style="padding-bottom: 8px;">${inquiry.name}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Email:</td>
                      <td style="padding-bottom: 8px;"><a href="mailto:${inquiry.email}" style="color: #d4a373; text-decoration: none;">${inquiry.email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Phone/Mobile:</td>
                      <td style="padding-bottom: 8px;">${inquiry.mobile}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Company/Brand:</td>
                      <td style="padding-bottom: 8px;">${inquiry.companyName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Occasion:</td>
                      <td style="padding-bottom: 8px;">${inquiry.inquiryType || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Quantity:</td>
                      <td style="padding-bottom: 8px;">${inquiry.quantity}</td>
                    </tr>
                    ${inquiry.logoUrl ? `
                    <tr>
                      <td style="padding-bottom: 8px; font-weight: bold;">Artwork/Logo:</td>
                      <td style="padding-bottom: 8px;"><a href="${inquiry.logoUrl}" target="_blank" style="color: #d4a373; text-decoration: underline;">View Artwork</a></td>
                    </tr>
                    ` : ''}
                  </table>

                  <!-- Message body block -->
                  <div style="margin-top: 20px; background-color: #fcfbf9; border-left: 4px solid #d4a373; padding: 16px; border-radius: 8px; font-size: 14px; color: #4a4540; line-height: 1.6; white-space: pre-wrap;">
                    <strong style="color: #2d2a26; display: block; margin-bottom: 8px;">Project Details:</strong>
                    ${inquiry.message}
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #faf8f5; padding: 20px; border-top: 1px solid #ebe6df; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #b5afa8;">Submitted via Giftcy B2B Bulk Order inquiry form.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    from: `"${inquiry.name}" <${inquiry.email}>`,
    replyTo: inquiry.email,
    to: 'giftcybag1609@gmail.com',
    subject,
    html,
    text: `New bulk inquiry from ${inquiry.name} (${inquiry.email}). Phone: ${inquiry.mobile}. Company: ${inquiry.companyName || 'N/A'}. Occasion: ${inquiry.inquiryType || 'N/A'}. Quantity: ${inquiry.quantity}. Artwork: ${inquiry.logoUrl || 'None'}. Message: ${inquiry.message}`,
  });
};
