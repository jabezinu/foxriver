const User = require('../models/User');
const Commission = require('../models/Commission');
const Membership = require('../models/Membership');

/**
 * Calculate commissions for A/B/C level referrals
 * A-level (direct referral): 10%
 * B-level (referral's referral): 5%
 * C-level (B-level's referral): 2%
 * 
 * Rule: No commission if downline joins at a higher level than referrer
 */
exports.calculateAndCreateCommissions = async (taskCompletion, earningsAmount) => {
    try {
        const user = await User.findById(taskCompletion.user);

        if (!user || !user.referrerId) {
            return; // No referrer, no commissions
        }

        const memberships = await Membership.find().sort({ order: 1 });
        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const userLevel = membershipOrder[user.membershipLevel];
        const commissions = [];

        // A-level (direct referrer)
        const aLevelUser = await User.findById(user.referrerId);
        if (aLevelUser) {
            const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
            // Only give commission if A-level user is at same or higher level
            if (aLevelOrder >= userLevel) {
                const aCommission = earningsAmount * 0.10;
                commissions.push({
                    user: aLevelUser._id,
                    downlineUser: user._id,
                    level: 'A',
                    percentage: 10,
                    amountEarned: aCommission,
                    sourceTask: taskCompletion._id
                });

                // Credit commission to A-level user's income wallet
                aLevelUser.incomeWallet += aCommission;
                await aLevelUser.save();

                // B-level (referrer's referrer)
                if (aLevelUser.referrerId) {
                    const bLevelUser = await User.findById(aLevelUser.referrerId);
                    if (bLevelUser) {
                        const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                        if (bLevelOrder >= userLevel) {
                            const bCommission = earningsAmount * 0.05;
                            commissions.push({
                                user: bLevelUser._id,
                                downlineUser: user._id,
                                level: 'B',
                                percentage: 5,
                                amountEarned: bCommission,
                                sourceTask: taskCompletion._id
                            });

                            // Credit commission to B-level user's income wallet
                            bLevelUser.incomeWallet += bCommission;
                            await bLevelUser.save();

                            // C-level (B-level's referrer)
                            if (bLevelUser.referrerId) {
                                const cLevelUser = await User.findById(bLevelUser.referrerId);
                                if (cLevelUser) {
                                    const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                    if (cLevelOrder >= userLevel) {
                                        const cCommission = earningsAmount * 0.02;
                                        commissions.push({
                                            user: cLevelUser._id,
                                            downlineUser: user._id,
                                            level: 'C',
                                            percentage: 2,
                                            amountEarned: cCommission,
                                            sourceTask: taskCompletion._id
                                        });

                                        // Credit commission to C-level user's income wallet
                                        cLevelUser.incomeWallet += cCommission;
                                        await cLevelUser.save();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Save all commission records
        if (commissions.length > 0) {
            await Commission.insertMany(commissions);
        }

        return commissions;
    } catch (error) {
        console.error('Error calculating commissions:', error);
        throw error;
    }
};
