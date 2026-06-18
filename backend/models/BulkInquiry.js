import mongoose from 'mongoose';

const bulkInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Please provide mobile number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    inquiryType: {
      type: String,
      default: 'Wedding',
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    message: {
      type: String,
      required: [true, 'Please add a details message'],
    },
    logoUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quotation Sent', 'Closed'],
      default: 'New',
    },
    quotationSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const BulkInquiry = mongoose.model('BulkInquiry', bulkInquirySchema);
export default BulkInquiry;
