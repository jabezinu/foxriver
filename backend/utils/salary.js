const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');

/**
 * Calculate monthly salary based on downline counts
 */
exports.calculateMonthlySalary = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { salary: 0, breakdown: null };
        }

        // Fetch dynamic settings
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = {
                salaryDirect15Threshold: 15,
                salaryDirect15Amount: 15000,
                salaryDirect20Threshold: 20,
                salaryDirect20Amount: 20000,
                salaryNetwork40Threshold: 40,
                salaryNetwork40Amount: 48000
            };
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
            salaryComponents: [],
            settings: {
                direct15: { threshold: settings.salaryDirect15Threshold, amount: settings.salaryDirect15Amount },
                direct20: { threshold: settings.salaryDirect20Threshold, amount: settings.salaryDirect20Amount },
                network40: { threshold: settings.salaryNetwork40Threshold, amount: settings.salaryNetwork40Amount }
            }
        };

        // Check Network Threshold (highest priority)
        if (totalCount >= settings.salaryNetwork40Threshold) {
            salary = settings.salaryNetwork40Amount;
            breakdown.salaryComponents.push({ rule: `${settings.salaryNetwork40Threshold} total network users`, amount: settings.salaryNetwork40Amount });
        }

        // Check Higher Direct Threshold
        if (aLevelCount >= settings.salaryDirect20Threshold) {
            const amount = settings.salaryDirect20Amount;
            if (amount > salary) {
                salary = amount;
                breakdown.salaryComponents = [{ rule: `${settings.salaryDirect20Threshold} direct A-level users`, amount: settings.salaryDirect20Amount }];
            }
        }

        // Check Lower Direct Threshold
        if (aLevelCount >= settings.salaryDirect15Threshold) {
            const amount = settings.salaryDirect15Amount;
            if (amount > salary) {
                salary = amount;
                breakdown.salaryComponents = [{ rule: `${settings.salaryDirect15Threshold} direct A-level users`, amount: settings.salaryDirect15Amount }];
            }
        }

        return { salary, breakdown };
    } catch (error) {
        console.error('Error calculating monthly salary:', error);
        throw error;
    }
};
