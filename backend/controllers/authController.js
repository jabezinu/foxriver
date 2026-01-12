const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isValidEthiopianPhone, generateInvitationCode } = require('../utils/validators');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { phone, password, invitationCode } = req.body;

    // Validate phone number
    if (!isValidEthiopianPhone(phone)) {
        throw new AppError('Please provide a valid Ethiopian phone number (+251XXXXXXXXX)', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone }).lean();
    if (existingUser) {
        throw new AppError('User already exists with this phone number', 400);
    }

    // Handle referral if invitation code provided
    let referrerId = null;
    if (invitationCode) {
        const referrer = await User.findOne({ invitationCode }).select('_id').lean();
        if (referrer) {
            referrerId = referrer._id;
        }
    }

    // Create user
    const user = await User.create({
        phone,
        password,
        referrerId,
        membershipLevel: 'Intern',
        invitationCode: generateInvitationCode()
    });

    // Generate token
    const token = generateToken(user._id);

    logger.info('User registered successfully', { userId: user._id, phone: user.phone });

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
            id: user._id,
            phone: user.phone,
            role: user.role,
            membershipLevel: user.membershipLevel,
            invitationCode: user.invitationCode
        }
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
        throw new AppError('Please provide phone number and password', 400);
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ phone }).select('+password');

    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info('User logged in successfully', { userId: user._id, phone: user.phone });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            phone: user.phone,
            role: user.role,
            membershipLevel: user.membershipLevel,
            invitationCode: user.invitationCode,
            incomeWallet: user.incomeWallet,
            personalWallet: user.personalWallet
        }
    });
});

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
exports.verify = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});
