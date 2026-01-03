const Membership = require('../models/Membership');
const User = require('../models/User');

// @desc    Get all membership tiers
// @route   GET /api/memberships/tiers
// @access  Public
exports.getTiers = async (req, res) => {
    try {
        const memberships = await Membership.find().sort({ order: 1 });

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

// @desc    Upgrade membership (requires deposit approval first)
// @route   POST /api/memberships/upgrade
// @access  Private
exports.upgradeMembership = async (req, res) => {
    try {
        const { newLevel } = req.body;

        const user = await User.findById(req.user.id);
        const currentMembership = await Membership.findOne({ level: user.membershipLevel });
        const newMembership = await Membership.findOne({ level: newLevel });

        if (!newMembership) {
            return res.status(404).json({
                success: false,
                message: 'Membership level not found'
            });
        }

        // Check if upgrade is valid (can only upgrade to higher level)
        if (newMembership.order <= currentMembership.order) {
            return res.status(400).json({
                success: false,
                message: 'Can only upgrade to a higher membership level'
            });
        }

        // Note: In a real scenario, this should be linked to a deposit approval
        // For now, we'll just update the level
        user.membershipLevel = newLevel;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Successfully upgraded to ${newLevel}`,
            user: {
                membershipLevel: user.membershipLevel,
                invitationCode: user.invitationCode
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
