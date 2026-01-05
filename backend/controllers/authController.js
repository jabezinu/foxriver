const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isValidEthiopianPhone, generateInvitationCode } = require('../utils/validators');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { phone, password, invitationCode } = req.body;

        // Validate phone number
        if (!isValidEthiopianPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid Ethiopian phone number (+251XXXXXXXXX)'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this phone number'
            });
        }

        // Handle referral if invitation code provided
        let referrerId = null;
        if (invitationCode) {
            const referrer = await User.findOne({ invitationCode });
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
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validate input
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone number and password'
            });
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ phone }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

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
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
exports.verify = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
