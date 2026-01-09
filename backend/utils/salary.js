const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const Membership = require('../models/Membership');

/**
 * Calculate monthly salary based on downline counts
 * Only counts referrals that are same level or lower than the inviter
 */
exports.calculateMonthlySalary = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { salary: 0, breakdown: null };
        }

        // Get membership levels for comparison
        const memberships = await Membership.find().sort({ order: 1 });
        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const userLevel = membershipOrder[user.membershipLevel];

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

        // Find all A-level (direct) referrals that are same level or lower
        const allALevelUsers = await User.find({ referrerId: userId });
        const aLevelUsers = allALevelUsers.filter(referral => {
            const referralLevel = membershipOrder[referral.membershipLevel];
            return referralLevel <= userLevel; // Only count same level or lower
        });
        const aLevelCount = aLevelUsers.length;

        // Find all B-level referrals that are same level or lower
        const aLevelIds = aLevelUsers.map(u => u._id);
        const allBLevelUsers = await User.find({ referrerId: { $in: aLevelIds } });
        const bLevelUsers = allBLevelUsers.filter(referral => {
            const referralLevel = membershipOrder[referral.membershipLevel];
            return referralLevel <= userLevel; // Only count same level or lower
        });
        const bLevelCount = bLevelUsers.length;

        // Find all C-level referrals that are same level or lower
        const bLevelIds = bLevelUsers.map(u => u._id);
        const allCLevelUsers = await User.find({ referrerId: { $in: bLevelIds } });
        const cLevelUsers = allCLevelUsers.filter(referral => {
            const referralLevel = membershipOrder[referral.membershipLevel];
            return referralLevel <= userLevel; // Only count same level or lower
        });
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
            },
            filteredReferrals: {
                totalALevel: allALevelUsers.length,
                qualifiedALevel: aLevelCount,
                totalBLevel: allBLevelUsers.length,
                qualifiedBLevel: bLevelCount,
                totalCLevel: allCLevelUsers.length,
                qualifiedCLevel: cLevelCount
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
