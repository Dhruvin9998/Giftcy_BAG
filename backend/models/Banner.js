import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide banner title'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide banner image URL'],
    },
    ctaText: {
      type: String,
      default: 'Shop Now',
    },
    ctaLink: {
      type: String,
      default: '/shop',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
