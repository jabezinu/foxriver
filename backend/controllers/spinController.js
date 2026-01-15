const { SpinResult, User, SlotTier, sequelize } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Spin the wheel
// @route   POST /api/spin
// @access  Private
exports.spinWheel = asyncHandler(async (req, res) => {
    const { walletType, tierId } = req.body;

    if (!tierId) throw new AppError('Tier ID is required', 400);
    if (!walletType || !['personal', 'income'].includes(walletType)) {
        throw new AppError('Valid wallet type required (personal or income)', 400);
    }

    const tier = await SlotTier.findByPk(tierId);
    if (!tier || !tier.isActive) throw new AppError('Invalid or inactive tier', 400);

    const spinCost = parseFloat(tier.betAmount);
    const winAmount = parseFloat(tier.winAmount);
    const winProbability = parseFloat(tier.winProbability) / 100;

    const user = await User.findByPk(req.user.id);
    const walletField = walletType === 'income' ? 'incomeWallet' : 'personalWallet';

    if (parseFloat(user[walletField]) < spinCost) {
        throw new AppError(`Insufficient ${walletType} balance. Need ${spinCost} ETB.`, 400);
    }

    const { result, amountWon, spinResultRecord } = await sequelize.transaction(async (t) => {
        const balanceBefore = parseFloat(user[walletField]);
        user[walletField] = parseFloat(user[walletField]) - spinCost;

        const isWin = Math.random() < winProbability;
        let spinResultText = 'Try Again';
        let winAmountEarned = 0;

        if (isWin) {
            spinResultText = `Win ${winAmount} ETB`;
            winAmountEarned = winAmount;
            user.incomeWallet = parseFloat(user.incomeWallet) + winAmountEarned;
        }

        await user.save({ transaction: t });

        const record = await SpinResult.create({
            user: user.id,
            result: spinResultText,
            amountPaid: spinCost,
            amountWon: winAmountEarned,
            balanceBefore,
            balanceAfter: parseFloat(user[walletField]),
            walletType,
            tier: tier.id
        }, { transaction: t });

        return { result: spinResultText, amountWon: winAmountEarned, spinResultRecord: record };
    });

    const userInfo = await User.findByPk(user.id, { attributes: ['phone', 'membershipLevel'] });

    res.status(200).json({
        success: true,
        data: {
            result,
            amountWon,
            balanceAfter: parseFloat(user[walletField]),
            incomeBalanceAfter: parseFloat(user.incomeWallet),
            spinResult: { ...spinResultRecord.toJSON(), user: userInfo }
        }
    });
});

// @desc    Get user's spin history
// @route   GET /api/spin/history
// @access  Private
exports.getUserSpinHistory = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count: total, rows: spins } = await SpinResult.findAndCountAll({
        where: { user: req.user.id },
        order: [['createdAt', 'DESC']],
        offset,
        limit
    });

    const stats = await SpinResult.findOne({
        where: { user: req.user.id },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalSpins'],
            [sequelize.fn('SUM', sequelize.col('amountPaid')), 'totalPaid'],
            [sequelize.fn('SUM', sequelize.col('amountWon')), 'totalWon'],
            [sequelize.literal(`SUM(CASE WHEN result LIKE 'Win%' THEN 1 ELSE 0 END)`), 'wins']
        ],
        raw: true
    });

    res.status(200).json({
        success: true,
        data: {
            spins,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            stats: stats || { totalSpins: 0, totalPaid: 0, totalWon: 0, wins: 0 }
        }
    });
});

// @desc    Get all spin results (Admin)
// @route   GET /api/spin/admin/all
// @access  Private/Admin
exports.getAllSpinResults = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.result) where.result = req.query.result;
    if (req.query.startDate || req.query.endDate) {
        where.createdAt = {};
        if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
        if (req.query.endDate) where.createdAt[Op.lte] = new Date(req.query.endDate);
    }

    const { count: total, rows: spins } = await SpinResult.findAndCountAll({
        where,
        include: [
            { model: User, as: 'player', attributes: ['phone', 'membershipLevel'] },
            { model: SlotTier, as: 'tierDetails', attributes: ['name', 'betAmount', 'winAmount'] }
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit
    });

    const stats = await SpinResult.findOne({
        where,
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalSpins'],
            [sequelize.fn('SUM', sequelize.col('amountPaid')), 'totalPaid'],
            [sequelize.fn('SUM', sequelize.col('amountWon')), 'totalWon'],
            [sequelize.literal(`SUM(CASE WHEN result LIKE 'Win%' THEN 1 ELSE 0 END)`), 'wins']
        ],
        raw: true
    });

    res.status(200).json({
        success: true,
        data: {
            spins,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            stats: stats || { totalSpins: 0, totalPaid: 0, totalWon: 0, wins: 0 }
        }
    });
});
