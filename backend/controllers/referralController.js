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

    // Helper to filter commission-eligible users (for commission calculations only)
    const filterCommissionEligible = (referral) => {
        const referralLevel = membershipOrder[referral.membershipLevel];
        return referral.membershipLevel !== 'Intern' && (referralLevel <= userLevel);
    };

    // A-level (direct referrals) - show ALL users
    const allALevel = await User.findAll({
        where: { referrerId: req.user.id },
        attributes: ['id', 'name', 'profilePhoto', 'phone', 'membershipLevel', 'createdAt', 'incomeWallet', 'personalWallet']
    });
    const commissionEligibleALevel = allALevel.filter(filterCommissionEligible);

    // B-level - show ALL users but calculate commissions only from eligible A-level users
    const commissionEligibleAIds = commissionEligibleALevel.map(u => u.id);
    const allAIds = allALevel.map(u => u.id);
    let allBLevel = [], commissionEligibleBLevel = [];
    if (allAIds.length > 0) {
        allBLevel = await User.findAll({
            where: { referrerId: allAIds },
            attributes: ['id', 'name', 'profilePhoto', 'phone', 'membershipLevel', 'createdAt', 'referrerId']
        });
        // Only B-level users from commission-eligible A-level users can earn commissions
        commissionEligibleBLevel = allBLevel.filter(u => 
            commissionEligibleAIds.includes(u.referrerId) && filterCommissionEligible(u)
        );
    }

    // C-level - show ALL users but calculate commissions only from eligible B-level users
    const commissionEligibleBIds = commissionEligibleBLevel.map(u => u.id);
    const allBIds = allBLevel.map(u => u.id);
    let allCLevel = [], commissionEligibleCLevel = [];
    if (allBIds.length > 0) {
        allCLevel = await User.findAll({
            where: { referrerId: allBIds },
            attributes: ['id', 'name', 'profilePhoto', 'phone', 'membershipLevel', 'createdAt', 'referrerId']
        });
        // Only C-level users from commission-eligible B-level users can earn commissions
        commissionEligibleCLevel = allCLevel.filter(u => 
            commissionEligibleBIds.includes(u.referrerId) && filterCommissionEligible(u)
        );
    }

    const downlineData = {
        // Display all users but track commission-eligible counts separately
        aLevel: { 
            count: commissionEligibleALevel.length, 
            totalCount: allALevel.length, 
            users: allALevel, // Show ALL A-level users
            commissionEligibleUsers: commissionEligibleALevel 
        },
        bLevel: { 
            count: commissionEligibleBLevel.length, 
            totalCount: allBLevel.length, 
            users: allBLevel, // Show ALL B-level users
            commissionEligibleUsers: commissionEligibleBLevel 
        },
        cLevel: { 
            count: commissionEligibleCLevel.length, 
            totalCount: allCLevel.length, 
            users: allCLevel, // Show ALL C-level users
            commissionEligibleUsers: commissionEligibleCLevel 
        },
        total: commissionEligibleALevel.length + commissionEligibleBLevel.length + commissionEligibleCLevel.length,
        totalAll: allALevel.length + allBLevel.length + allCLevel.length
    };

    // Cache for 30 seconds for more responsive updates
    cache.set(cacheKey, downlineData, 30);

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
    
    // Cache for 30 seconds for more responsive updates
    cache.set(cacheKey, responseData, 30);

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
    
    // Cache for 30 seconds for more responsive updates
    cache.set(cacheKey, responseData, 30);
    
    res.status(200).json({ success: true, ...responseData });
});
