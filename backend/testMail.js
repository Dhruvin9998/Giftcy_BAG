import nodemailer from 'nodemailer';
import './config/env.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('SMTP Config:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS);
console.log('From Name:', process.env.SMTP_FROM_NAME);
console.log('From Email:', process.env.SMTP_FROM_EMAIL);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function run() {
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: 'daxvaghasiya941@gmail.com',
    subject: 'Test SMTP Mail',
    text: 'If you see this, nodemailer SMTP is configured correctly and works.',
  });
  console.log('Email sent successfully:', info.messageId);
}

run().catch(console.error);
