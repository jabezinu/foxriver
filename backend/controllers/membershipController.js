const { Membership, User, sequelize } = require('../models');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// @desc    Get all membership tiers
// @route   GET /api/memberships/tiers
// @access  Public
exports.getTiers = asyncHandler(async (req, res) => {
    const memberships = await Membership.findAll({
        where: {
            [Op.or]: [
                { hidden: false },
                { hidden: null }
            ]
        },
        order: [['order', 'ASC']]
    });

    const tiersWithDetails = memberships.map(membership => ({
        level: membership.level,
        price: membership.price,
        canWithdraw: membership.canWithdraw,
        canUseTransactionPassword: membership.canUseTransactionPassword,
        dailyIncome: membership.getDailyIncome(),
        perVideoIncome: membership.getPerVideoIncome(),
        fourDayIncome: membership.getFourDayIncome(),
        dailyTasks: 4
    }));

    res.status(200).json({
        success: true,
        count: tiersWithDetails.length,
        tiers: tiersWithDetails
    });
});

// @desc    Upgrade membership (deducts from selected wallet)
// @route   POST /api/memberships/upgrade
// @access  Private
exports.upgradeMembership = asyncHandler(async (req, res) => {
    const { newLevel, walletType } = req.body;

    if (!['income', 'personal'].includes(walletType)) {
        throw new AppError('Invalid wallet type selected', 400);
    }

    const user = await User.findByPk(req.user.id);
    const [currentMembership, newMembership] = await Promise.all([
        Membership.findOne({ where: { level: user.membershipLevel } }),
        Membership.findOne({ where: { level: newLevel } })
    ]);

    if (!newMembership) throw new AppError('Membership level not found', 404);

    if (newMembership.order <= currentMembership.order) {
        throw new AppError('Can only upgrade to a higher membership level', 400);
    }

    const progressionCheck = await Membership.isProgressionAllowed(user.membershipLevel, newLevel);
    if (!progressionCheck.allowed) {
        throw new AppError(progressionCheck.reason, 400);
    }

    const walletField = walletType === 'income' ? 'incomeWallet' : 'personalWallet';
    if (parseFloat(user[walletField]) < parseFloat(newMembership.price)) {
        throw new AppError(`Insufficient funds in ${walletType} wallet`, 400);
    }

    // Atomic upgrade
    await sequelize.transaction(async (t) => {
        user[walletField] = parseFloat(user[walletField]) - parseFloat(newMembership.price);
        user.membershipLevel = newLevel;
        user.membershipActivatedAt = new Date();
        await user.save({ transaction: t });

        await calculateAndCreateMembershipCommissions(user, newMembership, { transaction: t });
    });

    res.status(200).json({
        success: true,
        message: `Successfully upgraded to ${newLevel}`,
        user: {
            membershipLevel: user.membershipLevel,
            incomeWallet: user.incomeWallet,
            personalWallet: user.personalWallet
        }
    });
});

// @desc    Get all membership tiers (including hidden) - Admin only
// @route   GET /api/memberships/admin/all
// @access  Private/Admin
exports.getAllTiers = asyncHandler(async (req, res) => {
    const memberships = await Membership.findAll({ order: [['order', 'ASC']] });

    const tiers = memberships.map(m => ({
        id: m.id,
        level: m.level,
        price: m.price,
        canWithdraw: m.canWithdraw,
        canUseTransactionPassword: m.canUseTransactionPassword,
        order: m.order,
        hidden: m.hidden,
        dailyIncome: m.getDailyIncome(),
        perVideoIncome: m.getPerVideoIncome(),
        fourDayIncome: m.getFourDayIncome(),
        dailyTasks: 4
    }));

    res.status(200).json({
        success: true,
        count: tiers.length,
        tiers
    });
});

// @desc    Hide/Unhide memberships by range
// @route   PUT /api/memberships/admin/toggle-range
// @access  Private/Admin
const updateVisibilityByRange = async (startRank, endRank, hidden) => {
    if (!startRank || !endRank) throw new AppError('Start and end ranks are required', 400);
    if (startRank < 1 || startRank > 10 || endRank < 1 || endRank > 10 || startRank > endRank) {
        throw new AppError('Invalid rank range', 400);
    }

    const levels = Array.from({ length: endRank - startRank + 1 }, (_, i) => `Rank ${startRank + i}`);
    return await Membership.update({ hidden }, { where: { level: { [Op.in]: levels } } });
};

exports.hideMembershipsByRange = asyncHandler(async (req, res) => {
    const { startRank, endRank } = req.body;
    const [count] = await updateVisibilityByRange(startRank, endRank, true);
    res.status(200).json({ success: true, message: `Hidden ${count} memberships` });
});

exports.unhideMembershipsByRange = asyncHandler(async (req, res) => {
    const { startRank, endRank } = req.body;
    const [count] = await updateVisibilityByRange(startRank, endRank, false);
    res.status(200).json({ success: true, message: `Unhidden ${count} memberships` });
});

// @desc    Toggle individual membership visibility
// @route   PUT /api/memberships/admin/toggle-visibility/:id
// @access  Private/Admin
exports.toggleMembershipVisibility = asyncHandler(async (req, res) => {
    const membership = await Membership.findByPk(req.params.id);
    if (!membership) throw new AppError('Membership not found', 404);

    membership.hidden = !membership.hidden;
    await membership.save();

    res.status(200).json({
        success: true,
        message: `Membership ${membership.hidden ? 'hidden' : 'visible'}`,
        membership: {
            id: membership.id,
            level: membership.level,
            hidden: membership.hidden
        }
    });
});

// @desc    Manage restricted range
// @route   PUT /api/memberships/admin/restricted-range
// @access  Private/Admin
exports.setRestrictedRange = asyncHandler(async (req, res) => {
    const { startRank, endRank } = req.body;

    if (!startRank || !endRank || startRank < 1 || endRank > 10 || startRank >= endRank) {
        throw new AppError('Invalid restricted range', 400);
    }

    await Membership.update(
        { restrictedRangeStart: startRank, restrictedRangeEnd: endRank },
        { where: { level: 'Intern' } }
    );

    res.status(200).json({ success: true, message: 'Sequential progression range updated' });
});

exports.getRestrictedRange = asyncHandler(async (req, res) => {
    const range = await Membership.getRestrictedRange();
    res.status(200).json({ success: true, restrictedRange: range });
});

exports.clearRestrictedRange = asyncHandler(async (req, res) => {
    await Membership.update(
        { restrictedRangeStart: null, restrictedRangeEnd: null },
        { where: { level: 'Intern' } }
    );
    res.status(200).json({ success: true, message: 'Restrictions cleared' });
});

// @desc    Update prices
// @route   PUT /api/memberships/admin/update-price/:id
// @access  Private/Admin
exports.updateMembershipPrice = asyncHandler(async (req, res) => {
    const { price } = req.body;
    if (price === undefined || price < 0) throw new AppError('Invalid price', 400);

    const membership = await Membership.findByPk(req.params.id);
    if (!membership) throw new AppError('Membership not found', 404);
    if (membership.level === 'Intern' && price !== 0) throw new AppError('Intern must be free', 400);

    membership.price = price;
    await membership.save();

    res.status(200).json({ success: true, membership });
});

// @desc    Bulk update membership prices
// @route   PUT /api/memberships/admin/bulk-update-prices
// @access  Private/Admin
exports.bulkUpdatePrices = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, price }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const { id, price } = update;

                if (!id || price === undefined || price === null) {
                    errors.push({ id, error: 'Missing id or price' });
                    continue;
                }

                if (price < 0) {
                    errors.push({ id, error: 'Price cannot be negative' });
                    continue;
                }

                const membership = await Membership.findByPk(id);

                if (!membership) {
                    errors.push({ id, error: 'Membership not found' });
                    continue;
                }

                // Prevent changing Intern price from 0
                if (membership.level === 'Intern' && price !== 0) {
                    errors.push({ id, error: 'Intern membership must remain free' });
                    continue;
                }

                membership.price = price;
                await membership.save();

                results.push({
                    id: membership.id,
                    level: membership.level,
                    price: membership.price
                });
            } catch (err) {
                errors.push({ id: update.id, error: err.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully updated ${results.length} membership price(s)`,
            updated: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
