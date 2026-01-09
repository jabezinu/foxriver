const User = require('../models/User');
const Commission = require('../models/Commission');
const { calculateMonthlySalary } = require('../utils/salary');

// @desc    Get user's downline (A/B/C levels)
// @route   GET /api/referrals/downline
// @access  Private
exports.getDownline = async (req, res) => {
    try {
        const Membership = require('../models/Membership');
        
        // Get membership levels for comparison
        const memberships = await Membership.find().sort({ order: 1 });
        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const user = await User.findById(req.user.id);
        const userLevel = membershipOrder[user.membershipLevel];

        // A-level (direct referrals) - all referrals
        const allALevelUsers = await User.find({ referrerId: req.user.id })
            .select('name profilePhoto phone membershipLevel createdAt incomeWallet personalWallet');

        // Filter A-level for qualified referrals (not Intern, equal or lower level)
        const qualifiedALevelUsers = allALevelUsers.filter(referral => {
            const referralLevel = membershipOrder[referral.membershipLevel];
            return referral.membershipLevel !== 'Intern' && referralLevel <= userLevel;
        });

        // B-level (referrals' referrals) - only from qualified A-level users
        const qualifiedALevelIds = qualifiedALevelUsers.map(u => u._id);
        let allBLevelUsers = [];
        let qualifiedBLevelUsers = [];
        
        if (qualifiedALevelIds.length > 0) {
            allBLevelUsers = await User.find({ referrerId: { $in: qualifiedALevelIds } })
                .select('name profilePhoto phone membershipLevel createdAt referrerId');
            
            qualifiedBLevelUsers = allBLevelUsers.filter(referral => {
                const referralLevel = membershipOrder[referral.membershipLevel];
                return referral.membershipLevel !== 'Intern' && referralLevel <= userLevel;
            });
        }

        // C-level (B-level's referrals) - only from qualified B-level users
        const qualifiedBLevelIds = qualifiedBLevelUsers.map(u => u._id);
        let allCLevelUsers = [];
        let qualifiedCLevelUsers = [];
        
        if (qualifiedBLevelIds.length > 0) {
            allCLevelUsers = await User.find({ referrerId: { $in: qualifiedBLevelIds } })
                .select('name profilePhoto phone membershipLevel createdAt referrerId');
            
            qualifiedCLevelUsers = allCLevelUsers.filter(referral => {
                const referralLevel = membershipOrder[referral.membershipLevel];
                return referral.membershipLevel !== 'Intern' && referralLevel <= userLevel;
            });
        }

        res.status(200).json({
            success: true,
            downline: {
                aLevel: {
                    count: qualifiedALevelUsers.length,
                    totalCount: allALevelUsers.length,
                    users: qualifiedALevelUsers,
                    allUsers: allALevelUsers
                },
                bLevel: {
                    count: qualifiedBLevelUsers.length,
                    totalCount: allBLevelUsers.length,
                    users: qualifiedBLevelUsers,
                    allUsers: allBLevelUsers
                },
                cLevel: {
                    count: qualifiedCLevelUsers.length,
                    totalCount: allCLevelUsers.length,
                    users: qualifiedCLevelUsers,
                    allUsers: allCLevelUsers
                },
                total: qualifiedALevelUsers.length + qualifiedBLevelUsers.length + qualifiedCLevelUsers.length,
                totalAll: allALevelUsers.length + allBLevelUsers.length + allCLevelUsers.length
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
            .populate('downlineUser', 'name profilePhoto phone membershipLevel')
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
