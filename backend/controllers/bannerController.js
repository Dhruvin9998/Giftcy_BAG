import Banner from '../models/Banner.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

export const getAllBanners = async (req, res, next) => {
  try {
    const isPublic = !req.headers.authorization;
    const filter = isPublic ? { active: true } : {};
    const banners = await Banner.find(filter).sort('-createdAt');
    new ApiResponse(200, banners, 'Banners retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, ctaText, ctaLink, active } = req.body;
    if (!title || !image) {
      return next(new ApiError(400, 'Title and image are required.'));
    }
    const banner = await Banner.create({ title, subtitle, image, ctaText, ctaLink, active });
    new ApiResponse(201, banner, 'Banner created successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) {
      return next(new ApiError(404, 'Banner not found'));
    }
    new ApiResponse(200, banner, 'Banner updated successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return next(new ApiError(404, 'Banner not found'));
    }
    new ApiResponse(200, null, 'Banner deleted successfully.').send(res);
  } catch (error) {
    next(error);
  }
};
