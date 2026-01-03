const User = require('../models/User');
const Commission = require('../models/Commission');
const { calculateMonthlySalary } = require('../utils/salary');

// @desc    Get user's downline (A/B/C levels)
// @route   GET /api/referrals/downline
// @access  Private
exports.getDownline = async (req, res) => {
    try {
        // A-level (direct referrals)
        const aLevelUsers = await User.find({ referrerId: req.user.id })
            .select('phone membershipLevel createdAt incomeWallet personalWallet');

        // B-level (referrals' referrals)
        const aLevelIds = aLevelUsers.map(u => u._id);
        const bLevelUsers = await User.find({ referrerId: { $in: aLevelIds } })
            .select('phone membershipLevel createdAt referrerId');

        // C-level (B-level's referrals)
        const bLevelIds = bLevelUsers.map(u => u._id);
        const cLevelUsers = await User.find({ referrerId: { $in: bLevelIds } })
            .select('phone membershipLevel createdAt referrerId');

        res.status(200).json({
            success: true,
            downline: {
                aLevel: {
                    count: aLevelUsers.length,
                    users: aLevelUsers
                },
                bLevel: {
                    count: bLevelUsers.length,
                    users: bLevelUsers
                },
                cLevel: {
                    count: cLevelUsers.length,
                    users: cLevelUsers
                },
                total: aLevelUsers.length + bLevelUsers.length + cLevelUsers.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get commission history
// @route   GET /api/referrals/commissions
// @access  Private
exports.getCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find({ user: req.user.id })
            .populate('downlineUser', 'phone membershipLevel')
            .populate('sourceTask')
            .sort({ createdAt: -1 });

        // Calculate totals by level
        const totals = {
            A: 0,
            B: 0,
            C: 0,
            total: 0
        };

        commissions.forEach(commission => {
            totals[commission.level] += commission.amountEarned;
            totals.total += commission.amountEarned;
        });

        res.status(200).json({
            success: true,
            count: commissions.length,
            totals,
            commissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get monthly salary calculation
// @route   GET /api/referrals/salary
// @access  Private
exports.getMonthlySalary = async (req, res) => {
    try {
        const salaryData = await calculateMonthlySalary(req.user.id);

        res.status(200).json({
            success: true,
            salary: salaryData.salary,
            breakdown: salaryData.breakdown
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
