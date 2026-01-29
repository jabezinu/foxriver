const { RankUpgradeRequest, Deposit, User, Membership, sequelize } = require('../models');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { generateOrderId } = require('../utils/validators');
const { Op } = require('sequelize');

// @desc    Create rank upgrade request with wallet payment
// @route   POST /api/rank-upgrades/request
// @access  Private
exports.createRankUpgradeRequest = asyncHandler(async (req, res) => {
    const { newLevel, amount, walletType } = req.body;

    if (!newLevel || !amount || !walletType) {
        throw new AppError('New level, amount, and wallet type are required', 400);
    }

    // Only allow Personal Wallet for rank upgrades
    if (walletType !== 'personal') {
        throw new AppError('Rank upgrades can only be paid from Personal Wallet', 400);
    }

    const user = await User.findByPk(req.user.id);
    const [currentMembership, newMembership] = await Promise.all([
        Membership.findOne({ where: { level: user.membershipLevel } }),
        Membership.findOne({ where: { level: newLevel } })
    ]);

    if (!newMembership) {
        throw new AppError('Membership level not found', 404);
    }

    // Check if the target membership tier is hidden
    if (newMembership.hidden) {
        throw new AppError('This membership tier is coming soon. Please stay tuned for updates!', 400);
    }

    if (newMembership.order <= currentMembership.order) {
        throw new AppError('Can only upgrade to a higher membership level', 400);
    }

    // Check progression rules
    const progressionCheck = await Membership.isProgressionAllowed(user.membershipLevel, newLevel);
    if (!progressionCheck.allowed) {
        throw new AppError(progressionCheck.reason, 400);
    }

    // Check if user has sufficient balance in Personal Wallet
    if (parseFloat(user.personalWallet) < parseFloat(amount)) {
        throw new AppError(`Insufficient Personal Wallet balance. You need ${amount} ETB but have ${user.personalWallet} ETB`, 400);
    }

    // Check if user has any pending rank upgrade requests
    const existingRequest = await RankUpgradeRequest.findOne({
        where: {
            user: req.user.id,
            status: 'pending'
        }
    });

    if (existingRequest) {
        throw new AppError('You already have a pending rank upgrade request', 400);
    }

    // Process the rank upgrade immediately using wallet funds
    await sequelize.transaction(async (t) => {
        // Deduct amount from Personal Wallet
        user.personalWallet = parseFloat(user.personalWallet) - parseFloat(amount);

        // refund the previous rank price to the personal wallet if the current level is not 'Intern'
        let previousRankRefund = 0;
        if (currentMembership.level !== 'Intern') {
             previousRankRefund = parseFloat(currentMembership.price);
             user.personalWallet = parseFloat(user.personalWallet) + previousRankRefund;
        }

        // Update user's membership level
        const oldMembershipLevel = user.membershipLevel;
        user.membershipLevel = newLevel;
        user.membershipActivatedAt = new Date();
        await user.save({ transaction: t });

        // Invalidate cache for the user and their referral chain when membership changes
        if (oldMembershipLevel === 'Intern' && newLevel !== 'Intern') {
            const { invalidateReferralChainCache } = require('../utils/cacheInvalidation');
            await invalidateReferralChainCache(user.id);
        }

        // Create the rank upgrade request record for tracking
        const rankUpgradeRequest = await RankUpgradeRequest.create({
            user: req.user.id,
            currentLevel: oldMembershipLevel,
            requestedLevel: newLevel,
            depositId: null, // No deposit needed for wallet payment
            status: 'approved', // Immediately approved since payment is from wallet
            approvedBy: req.user.id, // Self-approved via wallet payment
            approvedAt: new Date()
        }, { transaction: t });

        // Calculate and create membership commissions
        await calculateAndCreateMembershipCommissions(user, newMembership, { transaction: t });

        res.status(201).json({
            success: true,
            message: `Rank upgraded to ${newLevel} successfully!${previousRankRefund > 0 ? ` Refund of ${previousRankRefund} ETB added to Personal Wallet.` : ''}`,
            rankUpgradeRequest,
            newWalletBalances: {
                personalWallet: parseFloat(user.personalWallet),
                incomeWallet: parseFloat(user.incomeWallet),
                tasksWallet: parseFloat(user.tasksWallet)
            },
            previousRankRefund
        });
    });
});

// @desc    Get user's rank upgrade requests
// @route   GET /api/rank-upgrades/user
// @access  Private
exports.getUserRankUpgradeRequests = asyncHandler(async (req, res) => {
    const requests = await RankUpgradeRequest.findAll({
        where: { user: req.user.id },
        include: [
            {
                model: Deposit,
                as: 'deposit',
                attributes: ['id', 'amount', 'status', 'transactionFT', 'createdAt']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: requests.length,
        requests
    });
});

// @desc    Cancel rank upgrade request (only if deposit is still pending)
// @route   DELETE /api/rank-upgrades/:id/cancel
// @access  Private
exports.cancelRankUpgradeRequest = asyncHandler(async (req, res) => {
    const request = await RankUpgradeRequest.findOne({
        where: {
            id: req.params.id,
            user: req.user.id,
            status: 'pending'
        },
        include: [
            {
                model: Deposit,
                as: 'deposit'
            }
        ]
    });

    if (!request) {
        throw new AppError('Rank upgrade request not found or cannot be cancelled', 404);
    }

    // Can only cancel if deposit is still pending (no FT submitted)
    if (request.deposit.status !== 'pending') {
        throw new AppError('Cannot cancel request after deposit submission', 400);
    }

    await sequelize.transaction(async (t) => {
        // Update request status
        request.status = 'cancelled';
        await request.save({ transaction: t });

        // Note: We don't delete the deposit record for audit purposes
        // The deposit will remain in pending status
    });

    res.status(200).json({
        success: true,
        message: 'Rank upgrade request cancelled successfully'
    });
});

// @desc    Get all rank upgrade requests (admin)
// @route   GET /api/rank-upgrades/admin/all
// @access  Private/Admin
exports.getAllRankUpgradeRequests = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await RankUpgradeRequest.findAll({
        where: filter,
        include: [
            {
                model: User,
                as: 'userDetails',
                attributes: ['id', 'phone', 'membershipLevel']
            },
            {
                model: Deposit,
                as: 'deposit',
                attributes: ['id', 'amount', 'status', 'transactionFT', 'transactionScreenshot', 'createdAt']
            },
            {
                model: User,
                as: 'approver',
                attributes: ['phone']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: requests.length,
        requests
    });
});

// @desc    Approve rank upgrade request (admin) - called after deposit approval
// @route   PUT /api/rank-upgrades/:id/approve
// @access  Private/Admin
exports.approveRankUpgradeRequest = asyncHandler(async (req, res) => {
    const request = await RankUpgradeRequest.findOne({
        where: {
            id: req.params.id,
            status: 'pending'
        },
        include: [
            {
                model: User,
                as: 'userDetails'
            },
            {
                model: Deposit,
                as: 'deposit'
            }
        ]
    });

    if (!request) {
        throw new AppError('Rank upgrade request not found or already processed', 404);
    }

    // Verify the deposit is approved
    if (request.deposit.status !== 'approved') {
        throw new AppError('Cannot approve rank upgrade until deposit is approved', 400);
    }

    const newMembership = await Membership.findOne({
        where: { level: request.requestedLevel }
    });

    if (!newMembership) {
        throw new AppError('Target membership level not found', 404);
    }

    await sequelize.transaction(async (t) => {
        // Update user's membership level
        const oldMembershipLevel = user.membershipLevel;
        user.membershipLevel = request.requestedLevel;
        user.membershipActivatedAt = new Date();
        await user.save({ transaction: t });

        // Invalidate cache for the user and their referral chain when membership changes
        if (oldMembershipLevel === 'Intern' && request.requestedLevel !== 'Intern') {
            const { invalidateReferralChainCache } = require('../utils/cacheInvalidation');
            await invalidateReferralChainCache(user.id);
        }

        // Update request status
        request.status = 'approved';
        request.approvedBy = req.user.id;
        request.approvedAt = new Date();
        await request.save({ transaction: t });

        // Calculate and create membership commissions
        await calculateAndCreateMembershipCommissions(user, newMembership, { transaction: t });
    });

    res.status(200).json({
        success: true,
        message: `Rank upgrade to ${request.requestedLevel} approved successfully`,
        request
    });
});

// @desc    Reject rank upgrade request (admin)
// @route   PUT /api/rank-upgrades/:id/reject
// @access  Private/Admin
exports.rejectRankUpgradeRequest = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    
    const request = await RankUpgradeRequest.findOne({
        where: {
            id: req.params.id,
            status: 'pending'
        }
    });

    if (!request) {
        throw new AppError('Rank upgrade request not found or already processed', 404);
    }

    request.status = 'rejected';
    request.rejectionReason = reason;
    await request.save();

    res.status(200).json({
        success: true,
        message: 'Rank upgrade request rejected',
        request
    });
});