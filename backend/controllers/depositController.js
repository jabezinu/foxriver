const { Deposit, User, BankAccount } = require('../models');
const transactionService = require('../services/transactionService');
const { isValidDepositAmount, generateOrderId } = require('../utils/validators');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');

// @desc    Get allowed deposit amounts
// @route   GET /api/deposits/allowed-amounts
// @access  Public
exports.getAllowedDepositAmounts = asyncHandler(async (req, res) => {
    const Membership = require('../models/Membership');
    const { Op } = require('sequelize');
    
    const memberships = await Membership.findAll({
        attributes: ['price'],
        where: {
            price: { [Op.gt]: 0 } // Exclude free memberships (Intern)
        }
    });
    
    // Extract prices and convert to numbers - ONLY membership prices
    const allowedAmounts = memberships.map(m => parseFloat(m.price)).sort((a, b) => a - b);

    res.status(200).json({
        success: true,
        allowedAmounts
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
