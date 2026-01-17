const { User, Commission, Membership, TaskCompletion } = require('../models');
const { calculateMonthlySalary } = require('../utils/salary');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const cache = require('../utils/cache');

// @desc    Get user's downline (A/B/C levels)
// @route   GET /api/referrals/downline
// @access  Private
exports.getDownline = asyncHandler(async (req, res) => {
    // Check cache first
    const cacheKey = `downline:${req.user.id}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
        return res.status(200).json({
            success: true,
            downline: cachedData,
            cached: true
        });
    }

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

    const downlineData = {
        aLevel: { count: qualifiedALevel.length, totalCount: allALevel.length, users: qualifiedALevel, allUsers: allALevel },
        bLevel: { count: qualifiedBLevel.length, totalCount: allBLevel.length, users: qualifiedBLevel, allUsers: allBLevel },
        cLevel: { count: qualifiedCLevel.length, totalCount: allCLevel.length, users: qualifiedCLevel, allUsers: allCLevel },
        total: qualifiedALevel.length + qualifiedBLevel.length + qualifiedCLevel.length,
        totalAll: allALevel.length + allBLevel.length + allCLevel.length
    };

    // Cache for 2 minutes (120 seconds) for high traffic
    cache.set(cacheKey, downlineData, 120);

    res.status(200).json({
        success: true,
        downline: downlineData
    });
});

// @desc    Get commission history
// @route   GET /api/referrals/commissions
// @access  Private
exports.getCommissions = asyncHandler(async (req, res) => {
    // Check cache first
    const cacheKey = `commissions:${req.user.id}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
        return res.status(200).json({
            success: true,
            ...cachedData,
            cached: true
        });
    }

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

    const responseData = { count: commissions.length, totals, commissions };
    
    // Cache for 2 minutes (120 seconds) for high traffic
    cache.set(cacheKey, responseData, 120);

    res.status(200).json({ success: true, ...responseData });
});

// @desc    Get monthly salary calculation
// @route   GET /api/referrals/salary
// @access  Private
exports.getMonthlySalary = asyncHandler(async (req, res) => {
    // Check cache first
    const cacheKey = `salary:${req.user.id}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
        return res.status(200).json({
            success: true,
            ...cachedData,
            cached: true
        });
    }

    const salaryData = await calculateMonthlySalary(req.user.id);
    const responseData = { salary: salaryData.salary, breakdown: salaryData.breakdown };
    
    // Cache for 2 minutes (120 seconds) for high traffic
    cache.set(cacheKey, responseData, 120);
    
    res.status(200).json({ success: true, ...responseData });
});
