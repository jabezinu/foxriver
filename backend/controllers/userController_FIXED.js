const User = require('../models/User');
const { isValidTransactionPassword } = require('../utils/validators');
const cloudinary = require('../config/cloudinary');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.us