const { User, Commission, Membership, TaskCompletion } = require('../models');
const { calculateMonthlySalary } = require('../utils/salary');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get user's downline (A/B/C levels)
// @route   GET /api/referrals/downline
// @access  Private
exports.getDownline = asyncHandler(async (req, res) => {
    const memberships = await Membership.findAll({ order: [['order', 'ASC']] });
    const membershipOrder = {};
    memberships.forEach(m => { membershipOrder[m.level] = m.order; });

    const user = await User.findByPk(req.user.id);
    const userLevel = membershipOrder[user.membershipLevel];

    // Helper to filter qualified users
    const filterQualified = (referral) => {
        const referralLevel = membershipOrder[referral.membershipLevel];
        return referral.membershipLevel !== 'Intern' && (referralLevel <= userLevel);
    };

    // A-level
    const allALevel = await User.findAll({
        where: { referrerId: req.user.id },
        attributes: ['id', 'name', 'profilePhoto', 'phone', 'membershipLevel', 'createdAt', 'incomeWallet', 'personalWallet']
    });
    const qualifiedALevel = allALevel.filter(filterQualified);

    // B-level
    const qualifiedAIds = qualifiedALevel.map(u => u.id);
    let allBLevel = [], qualifiedBLevel = [];
    if (qualifiedAIds.length > 0) {
        allBLevel = await User.findAll({
            where: { referrerId: qualifiedAIds },
            attributes: ['id', 'name', 'profilePhoto', 'phone', 'membershipLevel', 'createdAt', 'referrerId']
        });
        qualifiedBLevel = allBLevel.filter(filterQualified);
    }

    // C-level
    const qualifiedBIds = qualifiedBLevel.map(u => u.id);
    let allCLevel = [], qualifiedCLevel = [];
    if (qualifiedBIds.length > 0) {
        allCLevel = await User.findAll({
            where: { referrerId: qualifiedBIds },
            attributes: ['id', 'name', 'profilePhoto', 'phone', 'membershipLevel', 'createdAt', 'referrerId']
        });
        qualifiedCLevel = allCLevel.filter(filterQualified);
    }

    res.status(200).json({
        success: true,
        downline: {
            aLevel: { count: qualifiedALevel.length, totalCount: allALevel.length, users: qualifiedALevel, allUsers: allALevel },
            bLevel: { count: qualifiedBLevel.length, totalCount: allBLevel.length, users: qualifiedBLevel, allUsers: allBLevel },
            cLevel: { count: qualifiedCLevel.length, totalCount: allCLevel.length, users: qualifiedCLevel, allUsers: allCLevel },
            total: qualifiedALevel.length + qualifiedBLevel.length + qualifiedCLevel.length,
            totalAll: allALevel.length + allBLevel.length + allCLevel.length
        }
    });
});

// @desc    Get commission history
// @route   GET /api/referrals/commissions
// @access  Private
exports.getCommissions = asyncHandler(async (req, res) => {
    const commissions = await Commission.findAll({
        where: { user: req.user.id },
        include: [
            { model: User, as: 'downline', attributes: ['name', 'profilePhoto', 'phone', 'membershipLevel'] },
            { model: TaskCompletion, as: 'taskSource' }
        ],
        order: [['createdAt', 'DESC']]
    });

    const totals = { A: 0, B: 0, C: 0, total: 0 };
    commissions.forEach(c => {
        const amount = parseFloat(c.amountEarned) || 0;
        totals[c.level] += amount;
        totals.total += amount;
    });

    res.status(200).json({ success: true, count: commissions.length, totals, commissions });
});

// @desc    Get monthly salary calculation
// @route   GET /api/referrals/salary
// @access  Private
exports.getMonthlySalary = asyncHandler(async (req, res) => {
    const salaryData = await calculateMonthlySalary(req.user.id);
    res.status(200).json({ success: true, salary: salaryData.salary, breakdown: salaryData.breakdown });
});
