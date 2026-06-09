import Settings from '../models/Settings.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * @desc    Get all website settings
 * @route   GET /api/v1/settings
 * @access  Public
 */
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.find();
    // Convert array to a key-value dictionary for easy client parsing
    const dictionary = {};
    settings.forEach((s) => {
      dictionary[s.key] = s.value;
    });
    new ApiResponse(200, dictionary, 'Settings retrieved successfully.').send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a specific setting key
 * @route   PUT /api/v1/settings/:key
 * @access  Private/Admin
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return next(new ApiError(400, 'Please provide a value to update'));
    }

    let setting = await Settings.findOne({ key });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Settings.create({ key, value });
    }

    new ApiResponse(200, setting, `Setting ${key} updated successfully.`).send(res);
  } catch (error) {
    next(error);
  }
};
