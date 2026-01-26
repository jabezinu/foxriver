const { Deposit, User, BankAccount } = require('../models');
const transactionService = require('../services/transactionService');
const { isValidDepositAmount, generateOrderId } = require('../utils/validators');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');

// @desc    Get allowed deposit amounts
// @route   GET /api/deposits/allowed-amounts
// @access  Public (but enhanced with user context if authenticated)
exports.getAllowedDepositAmounts = asyncHandler(async (req, res) => {
    const Membership = require('../models/Membership');
    const { Op } = require('sequelize');

    // Get all memberships with their details
    const memberships = await Membership.findAll({
        attributes: ['level', 'price', 'order', 'hidden'],
        where: {
            price: { [Op.gt]: 0 } // Exclude free memberships (Intern)
        },
        order: [['order', 'ASC']]
    });

    // Get restricted range
    const restrictedRange = await Membership.getRestrictedRange();

    // Extract prices and convert to numbers - ONLY membership prices
    const allowedAmounts = memberships.map(m => parseFloat(m.price)).sort((a, b) => a - b);

    // If user is authenticated, provide additional context
    let userContext = null;
    if (req.user) {
        const getCurrentRank = (level) => {
            if (level === 'Intern') return 0;
            const match = level.match(/Rank (\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        const currentRank = getCurrentRank(req.user.membershipLevel);

        // Determine which amounts are restricted for this user
        const restrictedAmounts = [];

        if (restrictedRange) {
            const { start, end } = restrictedRange;

            // Find memberships in restricted range that user cannot access
            for (const membership of memberships) {
                const membershipRank = getCurrentRank(membership.level);

                // If membership is in restricted range
                if (membershipRank >= start && membershipRank <= end) {
                    // Check if user can access this rank
                    const progression = await Membership.isProgressionAllowed(req.user.membershipLevel, membership.level);
                    if (!progression.allowed) {
                        restrictedAmounts.push(parseFloat(membership.price));
                    }
                }

                // Also check for hidden memberships
                if (membership.hidden) {
                    restrictedAmounts.push(parseFloat(membership.price));
                }
            }
        } else {
            // No restricted range, but still check for hidden memberships
            memberships.forEach(membership => {
                if (membership.hidden) {
                    restrictedAmounts.push(parseFloat(membership.price));
                }
            });
        }

        userContext = {
            currentLevel: req.user.membershipLevel,
            currentRank,
            restrictedAmounts: [...new Set(restrictedAmounts)] // Remove duplicates
        };
    }

    res.status(200).json({
        success: true,
        allowedAmounts,
        restrictedRange,
        userContext
    });
});

// @desc    Create deposit request
// @route   POST /api/deposits/create
// @access  Private
exports.createDeposit = asyncHandler(async (req, res) => {
    const { amount, paymentMethod } = req.body;

    if (!(await isValidDepositAmount(amount))) {
        throw new AppError('Invalid deposit amount', 400);
    }

    // Check if amount is restricted for this user
    const Membership = require('../models/Membership');

    // Get all memberships with their details
    const memberships = await Membership.findAll({
        attributes: ['level', 'price', 'order', 'hidden'],
        where: {
            price: { [Op.gt]: 0 }
        },
        order: [['order', 'ASC']]
    });

    // Get restricted range
    const restrictedRange = await Membership.getRestrictedRange();

    const getCurrentRank = (level) => {
        if (level === 'Intern') return 0;
        const match = level.match(/Rank (\d+)/);
        return match ? parseInt(match[1]) : 0;
    };

    const currentRank = getCurrentRank(req.user.membershipLevel);

    // Check if this amount corresponds to a restricted membership
    const targetMembership = memberships.find(m => parseFloat(m.price) === parseFloat(amount));

    if (targetMembership) {
        // Check if membership is hidden
        if (targetMembership.hidden) {
            throw new AppError('This membership level is currently not available', 400);
        }

        // Check rank progression restrictions
        if (restrictedRange) {
            const { start, end } = restrictedRange;
            const membershipRank = getCurrentRank(targetMembership.level);

            if (membershipRank >= start && membershipRank <= end) {
                const progression = await Membership.isProgressionAllowed(req.user.membershipLevel, targetMembership.level);
                if (!progression.allowed) {
                    throw new AppError(progression.reason || 'This membership level is restricted based on your current rank', 400);
                }
            }
        }
    }

    const deposit = await Deposit.create({
        user: req.user.id,
        amount,
        paymentMethod,
        orderId: generateOrderId()
    });

    res.status(201).json({
        success: true,
        message: 'Deposit request created. Please submit transaction ID.',
        deposit
    });
});

// @desc    Submit transaction ID for deposit
// @route   POST /api/deposits/submit-ft
// @access  Private
exports.submitTransactionFT = asyncHandler(async (req, res) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const { depositId, transactionFT } = req.body;

    if (!transactionFT) {
        throw new AppError('Transaction ID is required', 400);
    }

    if (!req.file) {
        throw new AppError('Transaction screenshot is required', 400);
    }

    const ftCode = transactionFT.trim().toUpperCase();
    const deposit = await Deposit.findByPk(depositId);

    if (!deposit) {
        throw new AppError('Deposit not found', 404);
    }

    if (deposit.user !== req.user.id) {
        throw new AppError('Not authorized', 403);
    }

    if (deposit.status !== 'pending') {
        throw new AppError('Transaction ID already submitted or deposit processed', 400);
    }

    // Check for uniqueness
    const existingDeposit = await Deposit.findOne({
        where: {
            transactionFT: ftCode,
            id: { [Op.ne]: depositId }
        }
    });

    if (existingDeposit) {
        throw new AppError("This Transaction ID isn't valid", 400);
    }

    // Upload to Cloudinary
    const uploadStream = () => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'transactions',
                    resource_type: 'image',
                    public_id: `transaction-${Date.now()}-${req.user.id}`
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });
    };

    const cloudinaryResult = await uploadStream();

    deposit.transactionFT = ftCode;
    deposit.transactionScreenshot = cloudinaryResult.secure_url;
    deposit.status = 'ft_submitted';
    await deposit.save();

    res.status(200).json({
        success: true,
        message: 'Transaction ID and screenshot submitted successfully. Awaiting admin approval.',
        deposit
    });
});

// @desc    Get user's deposits
// @route   GET /api/deposits/user
// @access  Private
exports.getUserDeposits = asyncHandler(async (req, res) => {
    const deposits = await Deposit.findAll({
        where: { user: req.user.id },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: deposits.length,
        deposits
    });
});

// @desc    Get all deposits (admin)
// @route   GET /api/deposits/all
// @access  Private/Admin
exports.getAllDeposits = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const deposits = await Deposit.findAll({
        where: filter,
        include: [
            { model: User, as: 'userDetails', attributes: ['phone', 'membershipLevel'] },
            { model: User, as: 'approver', attributes: ['phone'] },
            { model: BankAccount, as: 'paymentMethodDetails', attributes: ['bankName', 'accountNumber', 'accountHolderName'] },
            {
                model: require('../models').RankUpgradeRequest,
                as: 'rankUpgradeRequest',
                attributes: ['id', 'currentLevel', 'requestedLevel', 'status'],
                required: false
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: deposits.length,
        deposits
    });
});

// @desc    Approve deposit (admin)
// @route   PUT /api/deposits/:id/approve
// @access  Private/Admin
exports.approveDeposit = asyncHandler(async (req, res) => {
    const deposit = await transactionService.approveDeposit(
        req.params.id,
        req.user.id,
        req.body.notes
    );

    res.status(200).json({
        success: true,
        message: 'Deposit approved and amount credited to user wallet',
        deposit
    });
});

// @desc    Reject deposit (admin)
// @route   PUT /api/deposits/:id/reject
// @access  Private/Admin
exports.rejectDeposit = asyncHandler(async (req, res) => {
    const deposit = await transactionService.rejectDeposit(
        req.params.id,
        req.body.notes
    );

    res.status(200).json({
        success: true,
        message: 'Deposit rejected',
        deposit
    });
});
// @desc    Undo deposit (admin)
// @route   PUT /api/deposits/:id/undo
// @access  Private/Admin
exports.undoDeposit = asyncHandler(async (req, res) => {
    const deposit = await transactionService.undoDeposit(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Deposit status reset to submitted',
        deposit
    });
});
