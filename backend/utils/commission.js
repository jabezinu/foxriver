const User = require('../models/User');
const Commission = require('../models/Commission');
const Membership = require('../models/Membership');
const SystemSetting = require('../models/SystemSetting');

/**
 * Get system settings for commissions
 */
const getSettings = async () => {
    let settings = await SystemSetting.findOne();
    if (!settings) {
        settings = await SystemSetting.create({});
    }
    return settings;
};

/**
 * Calculate commissions for A/B/C level referrals
 */
exports.calculateAndCreateCommissions = async (taskCompletion, earningsAmount) => {
    try {
        const user = await User.findById(taskCompletion.user);

        if (!user || !user.referrerId) {
            return; // No referrer, no commissions
        }

        const settings = await getSettings();
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
            // Check maxReferralsPerUser limit if set
            if (settings.maxReferralsPerUser > 0) {
                const referralCount = await User.countDocuments({ referrerId: aLevelUser._id });
                if (referralCount > settings.maxReferralsPerUser) {
                    // This user has exceeded their referral limit for commissions
                    // But we still process B and C levels based on the chain? 
                    // Usually the limit is on the inviter's ability to EARN from new people.
                    // If A-level is over limit, they get nothing.
                } else {
                    await processALevel();
                }
            } else {
                await processALevel();
            }

            async function processALevel() {
                const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
                // Inviter gets commission only if referred user's level is equal or lower than inviter's level
                // AND the referred user is not an Intern (Intern doesn't qualify for commission)
                if (user.membershipLevel !== 'Intern' && userLevel <= aLevelOrder) {
                    const aCommission = earningsAmount * (settings.commissionPercentA / 100);
                    commissions.push({
                        user: aLevelUser._id,
                        downlineUser: user._id,
                        level: 'A',
                        percentage: settings.commissionPercentA,
                        amountEarned: aCommission,
                        sourceTask: taskCompletion._id
                    });
                    await User.findByIdAndUpdate(aLevelUser._id, { $inc: { incomeWallet: aCommission } });
                }
            }

            // B-level (referrer's referrer)
            if (aLevelUser.referrerId) {
                const bLevelUser = await User.findById(aLevelUser.referrerId);
                if (bLevelUser) {
                    const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                    // B-level inviter gets commission only if referred user's level is equal or lower
                    // AND the referred user is not an Intern
                    if (user.membershipLevel !== 'Intern' && userLevel <= bLevelOrder) {
                        const bCommission = earningsAmount * (settings.commissionPercentB / 100);
                        commissions.push({
                            user: bLevelUser._id,
                            downlineUser: user._id,
                            level: 'B',
                            percentage: settings.commissionPercentB,
                            amountEarned: bCommission,
                            sourceTask: taskCompletion._id
                        });
                        await User.findByIdAndUpdate(bLevelUser._id, { $inc: { incomeWallet: bCommission } });

                        // C-level (B-level's referrer)
                        if (bLevelUser.referrerId) {
                            const cLevelUser = await User.findById(bLevelUser.referrerId);
                            if (cLevelUser) {
                                const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                // C-level inviter gets commission only if referred user's level is equal or lower
                                // AND the referred user is not an Intern
                                if (user.membershipLevel !== 'Intern' && userLevel <= cLevelOrder) {
                                    const cCommission = earningsAmount * (settings.commissionPercentC / 100);
                                    commissions.push({
                                        user: cLevelUser._id,
                                        downlineUser: user._id,
                                        level: 'C',
                                        percentage: settings.commissionPercentC,
                                        amountEarned: cCommission,
                                        sourceTask: taskCompletion._id
                                    });
                                    await User.findByIdAndUpdate(cLevelUser._id, { $inc: { incomeWallet: cCommission } });
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
        console.error('Error calculating commissions:', error);
        throw error;
    }
};

/**
 * Calculate commissions for membership purchases
 */
exports.calculateAndCreateMembershipCommissions = async (user, newMembership) => {
    try {
        if (!user.referrerId || newMembership.level === 'Intern') {
            return [];
        }

        const settings = await getSettings();
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
            // Check maxReferralsPerUser limit if set
            let canEarnA = true;
            if (settings.maxReferralsPerUser > 0) {
                const referralCount = await User.countDocuments({ referrerId: aLevelUser._id });
                if (referralCount > settings.maxReferralsPerUser) {
                    canEarnA = false;
                }
            }

            if (canEarnA) {
                const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
                // Inviter gets commission only if purchased membership level is equal or lower than inviter's level
                // AND the purchased membership is not Intern
                if (newMembership.level !== 'Intern' && purchaseOrder <= aLevelOrder) {
                    const aCommission = newMembership.price * (settings.commissionPercentA / 100);
                    commissions.push({
                        user: aLevelUser._id,
                        downlineUser: user._id,
                        level: 'A',
                        percentage: settings.commissionPercentA,
                        amountEarned: aCommission,
                        sourceMembership: newMembership.level
                    });
                    await User.findByIdAndUpdate(aLevelUser._id, { $inc: { incomeWallet: aCommission } });
                }
            }

            // B-level
            if (aLevelUser.referrerId) {
                const bLevelUser = await User.findById(aLevelUser.referrerId);
                if (bLevelUser) {
                    const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                    // B-level inviter gets commission only if purchased membership level is equal or lower
                    // AND the purchased membership is not Intern
                    if (newMembership.level !== 'Intern' && purchaseOrder <= bLevelOrder) {
                        const bCommission = newMembership.price * (settings.commissionPercentB / 100);
                        commissions.push({
                            user: bLevelUser._id,
                            downlineUser: user._id,
                            level: 'B',
                            percentage: settings.commissionPercentB,
                            amountEarned: bCommission,
                            sourceMembership: newMembership.level
                        });
                        await User.findByIdAndUpdate(bLevelUser._id, { $inc: { incomeWallet: bCommission } });

                        // C-level
                        if (bLevelUser.referrerId) {
                            const cLevelUser = await User.findById(bLevelUser.referrerId);
                            if (cLevelUser) {
                                const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                // C-level inviter gets commission only if purchased membership level is equal or lower
                                // AND the purchased membership is not Intern
                                if (newMembership.level !== 'Intern' && purchaseOrder <= cLevelOrder) {
                                    const cCommission = newMembership.price * (settings.commissionPercentC / 100);
                                    commissions.push({
                                        user: cLevelUser._id,
                                        downlineUser: user._id,
                                        level: 'C',
                                        percentage: settings.commissionPercentC,
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

        if (commissions.length > 0) {
            await Commission.insertMany(commissions);
        }

        return commissions;
    } catch (error) {
        console.error('Error calculating membership commissions:', error);
        throw error;
    }
};
