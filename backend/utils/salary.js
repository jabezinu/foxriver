const User = require('../models/User');

/**
 * Calculate monthly salary based on downline counts
 * Rules:
 * - 15 A-level users (Direct): 15,000 ETB
 * - 20 A-level users (Direct): 20,000 ETB
 * - 40 total users (A+B+C): 48,000 ETB
 */
exports.calculateMonthlySalary = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { salary: 0, breakdown: null };
        }

        // Find all A-level (direct) referrals
        const aLevelUsers = await User.find({ referrerId: userId });
        const aLevelCount = aLevelUsers.length;

        // Find all B-level referrals
        const aLevelIds = aLevelUsers.map(u => u._id);
        const bLevelUsers = await User.find({ referrerId: { $in: aLevelIds } });
        const bLevelCount = bLevelUsers.length;

        // Find all C-level referrals
        const bLevelIds = bLevelUsers.map(u => u._id);
        const cLevelUsers = await User.find({ referrerId: { $in: bLevelIds } });
        const cLevelCount = cLevelUsers.length;

        const totalCount = aLevelCount + bLevelCount + cLevelCount;

        let salary = 0;
        const breakdown = {
            aLevel: aLevelCount,
            bLevel: bLevelCount,
            cLevel: cLevelCount,
            total: totalCount,
            salaryComponents: []
        };

        // Check 40 total users rule (highest priority: 48,000)
        if (totalCount >= 40) {
            salary = 48000;
            breakdown.salaryComponents.push({ rule: '40 total network users', amount: 48000 });
        }

        // Check 20 A-level users rule (20,000)
        if (aLevelCount >= 20) {
            const amount = 20000;
            if (amount > salary) {
                salary = amount;
                breakdown.salaryComponents = [{ rule: '20 direct A-level users', amount: 20000 }];
            }
        }

        // Check 15 A-level users rule (15,000)
        if (aLevelCount >= 15) {
            const amount = 15000;
            if (amount > salary) {
                salary = amount;
                breakdown.salaryComponents = [{ rule: '15 direct A-level users', amount: 15000 }];
            }
        }

        return { salary, breakdown };
    } catch (error) {
        console.error('Error calculating monthly salary:', error);
        throw error;
    }
};
