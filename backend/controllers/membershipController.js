const Membership = require('../models/Membership');
const User = require('../models/User');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');

// @desc    Get all membership tiers
// @route   GET /api/memberships/tiers
// @access  Public
exports.getTiers = async (req, res) => {
    try {
        // Filter out hidden memberships for regular users
        // Include memberships where hidden is false OR doesn't exist (for backward compatibility)
        const memberships = await Membership.find({ 
            $or: [{ hidden: false }, { hidden: { $exists: false } }] 
        }).sort({ order: 1 });

        const tiersWithDetails = memberships.map(membership => ({
            level: membership.level,
            price: membership.price,
            canWithdraw: membership.canWithdraw,
            canUseTransactionPassword: membership.canUseTransactionPassword,
            dailyIncome: membership.getDailyIncome(),
            perVideoIncome: membership.getPerVideoIncome(),
            fourDayIncome: membership.getFourDayIncome(),
            dailyTasks: 5
        }));

        res.status(200).json({
            success: true,
            count: tiersWithDetails.length,
            tiers: tiersWithDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Upgrade membership (deducts from selected wallet)
// @route   POST /api/memberships/upgrade
// @access  Private
exports.upgradeMembership = async (req, res) => {
    try {
        const { newLevel, walletType } = req.body;

        // Validate wallet type
        if (!['income', 'personal'].includes(walletType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wallet type selected'
            });
        }

        const user = await User.findById(req.user.id);
        const currentMembership = await Membership.findOne({ level: user.membershipLevel });
        const newMembership = await Membership.findOne({ level: newLevel });

        if (!newMembership) {
            return res.status(404).json({
                success: false,
                message: 'Membership level not found'
            });
        }

        // Check if upgrade is valid (can only upgrade to higher level or strictly higher?) 
        // Logic says "Upgrade", so strictly higher makes sense, but sometimes users might just want to pay to change. 
        // Based on previous code: newMembership.order <= currentMembership.order check exists. 
        // I will keep the check.
        if (newMembership.order <= currentMembership.order) {
            return res.status(400).json({
                success: false,
                message: 'Can only upgrade to a higher membership level'
            });
        }

        // Check rank progression restrictions
        const progressionCheck = await Membership.isProgressionAllowed(user.membershipLevel, newLevel);
        if (!progressionCheck.allowed) {
            return res.status(400).json({
                success: false,
                message: progressionCheck.reason
            });
        }

        // Check Balance
        const walletField = walletType === 'income' ? 'incomeWallet' : 'personalWallet';
        if (user[walletField] < newMembership.price) {
            return res.status(400).json({
                success: false,
                message: `Insufficient funds in ${walletType} wallet`
            });
        }

        // Deduct funds
        user[walletField] -= newMembership.price;

        // Update Level and reset activation date
        user.membershipLevel = newLevel;
        user.membershipActivatedAt = new Date(); // Reset activation date for new membership
        await user.save();

        // Calculate and credit membership commissions
        await calculateAndCreateMembershipCommissions(user, newMembership);

        res.status(200).json({
            success: true,
            message: `Successfully upgraded to ${newLevel}`,
            user: {
                membershipLevel: user.membershipLevel,
                incomeWallet: user.incomeWallet,
                personalWallet: user.personalWallet
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all membership tiers (including hidden) - Admin only
// @route   GET /api/memberships/admin/all
// @access  Private/Admin
exports.getAllTiers = async (req, res) => {
    try {
        const memberships = await Membership.find().sort({ order: 1 });

        const tiersWithDetails = memberships.map(membership => ({
            _id: membership._id,
            level: membership.level,
            price: membership.price,
            canWithdraw: membership.canWithdraw,
            canUseTransactionPassword: membership.canUseTransactionPassword,
            order: membership.order,
            hidden: membership.hidden,
            dailyIncome: membership.getDailyIncome(),
            perVideoIncome: membership.getPerVideoIncome(),
            fourDayIncome: membership.getFourDayIncome(),
            dailyTasks: 5
        }));

        res.status(200).json({
            success: true,
            count: tiersWithDetails.length,
            tiers: tiersWithDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Hide memberships by rank range
// @route   PUT /api/memberships/admin/hide-range
// @access  Private/Admin
exports.hideMembershipsByRange = async (req, res) => {
    try {
        const { startRank, endRank } = req.body;

        // Validate input
        if (!startRank || !endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank and end rank are required'
            });
        }

        if (startRank < 1 || startRank > 10 || endRank < 1 || endRank > 10) {
            return res.status(400).json({
                success: false,
                message: 'Ranks must be between 1 and 10'
            });
        }

        if (startRank > endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank must be less than or equal to end rank'
            });
        }

        // Build level array for the range
        const levels = [];
        for (let i = startRank; i <= endRank; i++) {
            levels.push(`Rank ${i}`);
        }

        // Update memberships
        const result = await Membership.updateMany(
            { level: { $in: levels } },
            { $set: { hidden: true } }
        );

        res.status(200).json({
            success: true,
            message: `Successfully hidden memberships from Rank ${startRank} to Rank ${endRank}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Unhide memberships by rank range
// @route   PUT /api/memberships/admin/unhide-range
// @access  Private/Admin
exports.unhideMembershipsByRange = async (req, res) => {
    try {
        const { startRank, endRank } = req.body;

        // Validate input
        if (!startRank || !endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank and end rank are required'
            });
        }

        if (startRank < 1 || startRank > 10 || endRank < 1 || endRank > 10) {
            return res.status(400).json({
                success: false,
                message: 'Ranks must be between 1 and 10'
            });
        }

        if (startRank > endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank must be less than or equal to end rank'
            });
        }

        // Build level array for the range
        const levels = [];
        for (let i = startRank; i <= endRank; i++) {
            levels.push(`Rank ${i}`);
        }

        // Update memberships
        const result = await Membership.updateMany(
            { level: { $in: levels } },
            { $set: { hidden: false } }
        );

        res.status(200).json({
            success: true,
            message: `Successfully unhidden memberships from Rank ${startRank} to Rank ${endRank}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Set restricted rank progression range
// @route   PUT /api/memberships/admin/set-restricted-range
// @access  Private/Admin
exports.setRestrictedRange = async (req, res) => {
    try {
        const { startRank, endRank } = req.body;

        // Validate input
        if (!startRank || !endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank and end rank are required'
            });
        }

        if (startRank < 1 || startRank > 10 || endRank < 1 || endRank > 10) {
            return res.status(400).json({
                success: false,
                message: 'Ranks must be between 1 and 10'
            });
        }

        if (startRank > endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank must be less than or equal to end rank'
            });
        }

        if (endRank - startRank < 1) {
            return res.status(400).json({
                success: false,
                message: 'Restricted range must include at least 2 ranks'
            });
        }

        // Store the restriction in the Intern membership document
        await Membership.updateOne(
            { level: 'Intern' },
            { 
                $set: { 
                    restrictedRangeStart: startRank,
                    restrictedRangeEnd: endRank
                } 
            }
        );

        res.status(200).json({
            success: true,
            message: `Sequential progression is now required from Rank ${startRank} to Rank ${endRank}`,
            restrictedRange: {
                start: startRank,
                end: endRank
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get restricted rank progression range
// @route   GET /api/memberships/admin/restricted-range
// @access  Private/Admin
exports.getRestrictedRange = async (req, res) => {
    try {
        const restrictedRange = await Membership.getRestrictedRange();

        res.status(200).json({
            success: true,
            restrictedRange: restrictedRange || null,
            message: restrictedRange 
                ? `Sequential progression required from Rank ${restrictedRange.start} to Rank ${restrictedRange.end}`
                : 'No rank progression restrictions are currently set'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Clear restricted rank progression range
// @route   DELETE /api/memberships/admin/restricted-range
// @access  Private/Admin
exports.clearRestrictedRange = async (req, res) => {
    try {
        // Clear the restriction from the Intern membership document
        await Membership.updateOne(
            { level: 'Intern' },
            { 
                $set: { 
                    restrictedRangeStart: null,
                    restrictedRangeEnd: null
                } 
            }
        );

        res.status(200).json({
            success: true,
            message: 'Rank progression restrictions have been cleared. Users can now skip ranks freely.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
