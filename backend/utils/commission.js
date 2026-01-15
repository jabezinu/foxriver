const User = require('../models/User');
const Commission = require('../models/Commission');
const Membership = require('../models/Membership');
const SystemSetting = require('../models/SystemSetting');
const { Op } = require('sequelize');

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
        const user = await User.findByPk(taskCompletion.user);

        if (!user || !user.referrerId) {
            return; // No referrer, no commissions
        }

        const settings = await getSettings();
        const memberships = await Membership.findAll({ order: [['order', 'ASC']] });
        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const userLevel = membershipOrder[user.membershipLevel];
        const commissions = [];

        // A-level (direct referrer)
        const aLevelUser = await User.findByPk(user.referrerId);
        if (aLevelUser) {
            // Check maxReferralsPerUser limit if set
            if (settings.maxReferralsPerUser > 0) {
                const referralCount = await User.count({ where: { referrerId: aLevelUser.id } });
                if (referralCount > settings.maxReferralsPerUser) {
                    // This user has exceeded their referral limit for commissions
                } else {
                    await processALevel();
                }
            } else {
                await processALevel();
            }

            async function processALevel() {
                const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
                if (user.membershipLevel !== 'Intern' && userLevel <= aLevelOrder) {
                    const aCommission = earningsAmount * (settings.commissionPercentA / 100);
                    commissions.push({
                        user: aLevelUser.id,
                        downlineUser: user.id,
                        level: 'A',
                        percentage: settings.commissionPercentA,
                        amountEarned: aCommission,
                        sourceTask: taskCompletion.id
                    });
                    aLevelUser.incomeWallet = parseFloat(aLevelUser.incomeWallet) + aCommission;
                    await aLevelUser.save();
                }
            }

            // B-level (referrer's referrer)
            if (aLevelUser.referrerId) {
                const bLevelUser = await User.findByPk(aLevelUser.referrerId);
                if (bLevelUser) {
                    const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                    if (user.membershipLevel !== 'Intern' && userLevel <= bLevelOrder) {
                        const bCommission = earningsAmount * (settings.commissionPercentB / 100);
                        commissions.push({
                            user: bLevelUser.id,
                            downlineUser: user.id,
                            level: 'B',
                            percentage: settings.commissionPercentB,
                            amountEarned: bCommission,
                            sourceTask: taskCompletion.id
                        });
                        bLevelUser.incomeWallet = parseFloat(bLevelUser.incomeWallet) + bCommission;
                        await bLevelUser.save();

                        // C-level (B-level's referrer)
                        if (bLevelUser.referrerId) {
                            const cLevelUser = await User.findByPk(bLevelUser.referrerId);
                            if (cLevelUser) {
                                const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                if (user.membershipLevel !== 'Intern' && userLevel <= cLevelOrder) {
                                    const cCommission = earningsAmount * (settings.commissionPercentC / 100);
                                    commissions.push({
                                        user: cLevelUser.id,
                                        downlineUser: user.id,
                                        level: 'C',
                                        percentage: settings.commissionPercentC,
                                        amountEarned: cCommission,
                                        sourceTask: taskCompletion.id
                                    });
                                    cLevelUser.incomeWallet = parseFloat(cLevelUser.incomeWallet) + cCommission;
                                    await cLevelUser.save();
                                }
                            }
                        }
                    }
                }
            }
        }

        if (commissions.length > 0) {
            await Commission.bulkCreate(commissions);
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
        const memberships = await Membership.findAll({ order: [['order', 'ASC']] });
        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const purchaseOrder = newMembership.order;
        const commissions = [];

        // A-level (direct referrer)
        const aLevelUser = await User.findByPk(user.referrerId);
        if (aLevelUser) {
            // Check maxReferralsPerUser limit if set
            let canEarnA = true;
            if (settings.maxReferralsPerUser > 0) {
                const referralCount = await User.count({ where: { referrerId: aLevelUser.id } });
                if (referralCount > settings.maxReferralsPerUser) {
                    canEarnA = false;
                }
            }

            if (canEarnA) {
                const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
                if (newMembership.level !== 'Intern' && purchaseOrder <= aLevelOrder) {
                    const aCommission = newMembership.price * (settings.commissionPercentA / 100);
                    commissions.push({
                        user: aLevelUser.id,
                        downlineUser: user.id,
                        level: 'A',
                        percentage: settings.commissionPercentA,
                        amountEarned: aCommission,
                        sourceMembership: newMembership.level
                    });
                    aLevelUser.incomeWallet = parseFloat(aLevelUser.incomeWallet) + aCommission;
                    await aLevelUser.save();
                }
            }

            // B-level
            if (aLevelUser.referrerId) {
                const bLevelUser = await User.findByPk(aLevelUser.referrerId);
                if (bLevelUser) {
                    const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                    if (newMembership.level !== 'Intern' && purchaseOrder <= bLevelOrder) {
                        const bCommission = newMembership.price * (settings.commissionPercentB / 100);
                        commissions.push({
                            user: bLevelUser.id,
                            downlineUser: user.id,
                            level: 'B',
                            percentage: settings.commissionPercentB,
                            amountEarned: bCommission,
                            sourceMembership: newMembership.level
                        });
                        bLevelUser.incomeWallet = parseFloat(bLevelUser.incomeWallet) + bCommission;
                        await bLevelUser.save();

                        // C-level
                        if (bLevelUser.referrerId) {
                            const cLevelUser = await User.findByPk(bLevelUser.referrerId);
                            if (cLevelUser) {
                                const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                if (newMembership.level !== 'Intern' && purchaseOrder <= cLevelOrder) {
                                    const cCommission = newMembership.price * (settings.commissionPercentC / 100);
                                    commissions.push({
                                        user: cLevelUser.id,
                                        downlineUser: user.id,
                                        level: 'C',
                                        percentage: settings.commissionPercentC,
                                        amountEarned: cCommission,
                                        sourceMembership: newMembership.level
                                    });
                                    cLevelUser.incomeWallet = parseFloat(cLevelUser.incomeWallet) + cCommission;
                                    await cLevelUser.save();
                                }
                            }
                        }
                    }
                }
            }
        }

        if (commissions.length > 0) {
            await Commission.bulkCreate(commissions);
        }

        return commissions;
    } catch (error) {
        console.error('Error calculating membership commissions:', error);
        throw error;
    }
};
