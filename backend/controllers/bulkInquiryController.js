import BulkInquiry from '../models/BulkInquiry.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { sendBulkInquiryEmail } from '../services/emailService.js';

export const submitBulkInquiry = async (req, res, next) => {
  try {
    const { name, mobile, email, companyName, inquiryType, quantity, message, logoUrl } = req.body;
    if (!name || !mobile || !email || !quantity || !message) {
      return next(new ApiError(400, 'Please fill in all required fields (name, mobile, email, quantity, message)'));
    }

    const inquiry = await BulkInquiry.create({
      name,
      mobile,
      email,
      companyName,
      inquiryType,
      quantity: Number(quantity),
      message,
      logoUrl: logoUrl || null
    });

    try {
      await sendBulkInquiryEmail(inquiry);
    } catch (emailError) {
      console.error('Error sending bulk inquiry email:', emailError);
    }

    new ApiResponse(201, inquiry, 'Your bulk inquiry was submitted successfully! Our B2B concierge will get back to you.').send(res);
  } catch (error) {
    next(error);
  }
};

export const getAllBulkInquiries = async (req, res, next) => {
  try {
    const inquiries = await BulkInquiry.find().sort('-createdAt');
    new ApiResponse(200, inquiries, 'Bulk inquiries retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['New', 'Contacted', 'Quotation Sent', 'Closed'].includes(status)) {
      return next(new ApiError(400, 'Invalid status selection'));
    }

    const inquiry = await BulkInquiry.findById(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Bulk inquiry not found'));
    }

    inquiry.status = status;
    if (status === 'Quotation Sent') {
      inquiry.quotationSentAt = new Date();
    }
    await inquiry.save();

    new ApiResponse(200, inquiry, 'Inquiry status updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};
