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

                // Credit commission to A-level user's income balance atomically
                await User.findByIdAndUpdate(aLevelUser._id, { $inc: { incomeWallet: aCommission } });

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

                            // Credit commission to B-level user's income balance atomically
                            await User.findByIdAndUpdate(bLevelUser._id, { $inc: { incomeWallet: bCommission } });

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

                                        // Credit commission to C-level user's income balance atomically
                                        await User.findByIdAndUpdate(cLevelUser._id, { $inc: { incomeWallet: cCommission } });
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
/**
 * Calculate commissions for membership purchases
 * A-level: 10%
 * B-level: 5%
 * C-level: 2%
 * 
 * Rules:
 * 1. Inviter only earns if newMembership.order <= inviter.membership.order
 * 2. No commission if the invited user joins with Intern level
 */
exports.calculateAndCreateMembershipCommissions = async (user, newMembership) => {
    try {
        if (!user.referrerId || newMembership.level === 'Intern') {
            return [];
        }

        const memberships = await Membership.find().sort({ order: 1 });
        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const purchaseOrder = newMembership.order;
        const commissions = [];

        // A-level (direct referrer)
        const aLevelUser = await User.findById(user.referrerId);
        if (aLevelUser) {
            const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
            // Rule: Inviter only earns if new membership is equal or lower level than inviter
            if (aLevelOrder >= purchaseOrder) {
                const aCommission = newMembership.price * 0.10;
                commissions.push({
                    user: aLevelUser._id,
                    downlineUser: user._id,
                    level: 'A',
                    percentage: 10,
                    amountEarned: aCommission,
                    sourceMembership: newMembership.level
                });
                await User.findByIdAndUpdate(aLevelUser._id, { $inc: { incomeWallet: aCommission } });

                // B-level
                if (aLevelUser.referrerId) {
                    const bLevelUser = await User.findById(aLevelUser.referrerId);
                    if (bLevelUser) {
                        const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                        if (bLevelOrder >= purchaseOrder) {
                            const bCommission = newMembership.price * 0.05;
                            commissions.push({
                                user: bLevelUser._id,
                                downlineUser: user._id,
                                level: 'B',
                                percentage: 5,
                                amountEarned: bCommission,
                                sourceMembership: newMembership.level
                            });
                            await User.findByIdAndUpdate(bLevelUser._id, { $inc: { incomeWallet: bCommission } });

                            // C-level
                            if (bLevelUser.referrerId) {
                                const cLevelUser = await User.findById(bLevelUser.referrerId);
                                if (cLevelUser) {
                                    const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                    if (cLevelOrder >= purchaseOrder) {
                                        const cCommission = newMembership.price * 0.02;
                                        commissions.push({
                                            user: cLevelUser._id,
                                            downlineUser: user._id,
                                            level: 'C',
                                            percentage: 2,
                                            amountEarned: cCommission,
                                            sourceMembership: newMembership.level
                                        });
                                        await User.findByIdAndUpdate(cLevelUser._id, { $inc: { incomeWallet: cCommission } });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (commissions.length > 0) {
            await Commission.insertMany(commissions);
        }

        return commissions;
    } catch (error) {
        console.error('Error calculating membership commissions:', error);
        throw error;
    }
};
