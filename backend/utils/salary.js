const User = require('../models/User');

/**
 * Calculate monthly salary based on downline counts
 * Rules:
 * - 15 A-level users: 16,000 ETB
 * - 24 A-level users: 23,000 ETB
 * - 150 total users (A+B+C): 48,000 ETB
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

        // Check 150 total users rule (highest priority)
        if (totalCount >= 150) {
            salary = 48000;
            breakdown.salaryComponents.push({ rule: '150 total users', amount: 48000 });
        }

        // Check 24 A-level users rule
        if (aLevelCount >= 24) {
            const bonus = 23000;
            if (bonus > salary) {
                salary = bonus;
                breakdown.salaryComponents = [{ rule: '24 A-level users', amount: 23000 }];
            }
        }

        // Check 15 A-level users rule
        if (aLevelCount >= 15) {
            const bonus = 16000;
            if (bonus > salary && aLevelCount < 24) {
                salary = bonus;
                breakdown.salaryComponents = [{ rule: '15 A-level users', amount: 16000 }];
            }
        }

        return { salary, breakdown };
    } catch (error) {
        console.error('Error calculating monthly salary:', error);
        throw error;
    }
};
