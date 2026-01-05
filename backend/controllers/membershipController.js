const Membership = require('../models/Membership');
const User = require('../models/User');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');

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

        // Update Level
        user.membershipLevel = newLevel;
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
