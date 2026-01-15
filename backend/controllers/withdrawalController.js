const { Withdrawal, User } = require('../models');
const transactionService = require('../services/transactionService');
const { isValidWithdrawalAmount } = require('../utils/validators');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Create withdrawal request
// @route   POST /api/withdrawals/create
// @access  Private (Rank 1+)
exports.createWithdrawal = asyncHandler(async (req, res) => {
    const { amount, walletType, transactionPassword } = req.body;

    // Check for withdrawal restriction
    if (req.user.withdrawalRestrictedUntil && new Date(req.user.withdrawalRestrictedUntil) > new Date()) {
        const restrictedDate = new Date(req.user.withdrawalRestrictedUntil).toLocaleDateString();
        throw new AppError(`Withdrawal restricted until ${restrictedDate}`, 403);
    }

    // Validate amount
    if (!isValidWithdrawalAmount(amount)) {
        throw new AppError('Invalid withdrawal amount', 400);
    }

    // Verify transaction password
    const user = await User.findByPk(req.user.id);

    if (!user.transactionPassword) {
        throw new AppError('Please set transaction password first', 400);
    }

    if (transactionPassword.length !== 6) {
        throw new AppError('Transaction password must be exactly 6 digits', 400);
    }

    const isMatch = await user.matchTransactionPassword(transactionPassword);
    if (!isMatch) {
        throw new AppError('Incorrect transaction password', 401);
    }

    // Check if user has sufficient balance
    const walletBalance = walletType === 'income' ? user.incomeWallet : user.personalWallet;

    if (walletBalance < amount) {
        throw new AppError('Insufficient wallet balance', 400);
    }

    // Create withdrawal (tax calculation is done in model pre-save hook)
    const withdrawal = await Withdrawal.create({
        user: req.user.id,
        amount,
        walletType
    });

    res.status(201).json({
        success: true,
        message: 'Withdrawal request created. Awaiting admin approval.',
        withdrawal,
        note: `10% tax will be deducted. You will receive ${withdrawal.netAmount} ETB`
    });
});

// @desc    Get user's withdrawals
// @route   GET /api/withdrawals/user
// @access  Private
exports.getUserWithdrawals = asyncHandler(async (req, res) => {
    const withdrawals = await Withdrawal.findAll({
        where: { user: req.user.id },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: withdrawals.length,
        withdrawals
    });
});

// @desc    Get all withdrawals (admin)
// @route   GET /api/withdrawals/all
// @access  Private/Admin
exports.getAllWithdrawals = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const where = status ? { status } : {};

    const withdrawals = await Withdrawal.findAll({
        where,
        include: [
            { model: User, as: 'userDetails', attributes: ['phone', 'membershipLevel', 'bankAccount'] },
            { model: User, as: 'approver', attributes: ['phone'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: withdrawals.length,
        withdrawals
    });
});

// @desc    Approve withdrawal (admin)
// @route   PUT /api/withdrawals/:id/approve
// @access  Private/Admin
exports.approveWithdrawal = asyncHandler(async (req, res) => {
    const withdrawal = await transactionService.approveWithdrawal(
        req.params.id,
        req.user.id,
        req.body.notes
    );

    res.status(200).json({
        success: true,
        message: 'Withdrawal approved and amount deducted from user wallet',
        withdrawal
    });
});

// @desc    Reject withdrawal (admin)
// @route   PUT /api/withdrawals/:id/reject
// @access  Private/Admin
exports.rejectWithdrawal = asyncHandler(async (req, res) => {
    const withdrawal = await transactionService.rejectWithdrawal(
        req.params.id,
        req.body.notes
    );

    res.status(200).json({
        success: true,
        message: 'Withdrawal rejected',
        withdrawal
    });
});
