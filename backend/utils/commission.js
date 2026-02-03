const { User, Commission, Membership, SystemSetting } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * Get system settings for commissions
 */
const getSettings = async (options = {}) => {
    let settings = await SystemSetting.findOne(options);
    if (!settings) {
        settings = await SystemSetting.create({}, options);
    }
    return settings;
};

/**
 * Calculate commissions for A/B/C level referrals
 */
exports.calculateAndCreateCommissions = async (taskCompletion, earningsAmount, options = {}) => {
    const { transaction } = options;
    try {
        const user = await User.findByPk(taskCompletion.user, options);

        if (!user || !user.referrerId) {
            return; // No referrer, no commissions
        }

        const settings = await getSettings(options);
        const memberships = await Membership.findAll({
            order: [['order', 'ASC']],
            ...options
        });

        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const userLevel = membershipOrder[user.membershipLevel];
        const commissions = [];

        // A-level (direct referrer)
        const aLevelUser = await User.findByPk(user.referrerId, options);
        if (aLevelUser) {
            // Check maxReferralsPerUser limit if set
            let canEarnA = true;
            if (settings.maxReferralsPerUser > 0) {
                const referralCount = await User.count({
                    where: { referrerId: aLevelUser.id },
                    ...options
                });
                if (referralCount > settings.maxReferralsPerUser) {
                    canEarnA = false;
                }
            }

            if (canEarnA) {
                const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
                if (user.membershipLevel !== 'Intern' && userLevel <= aLevelOrder) {
                    const aCommission = earningsAmount * (parseFloat(settings.commissionPercentA) / 100);
                    commissions.push({
                        user: aLevelUser.id,
                        downlineUser: user.id,
                        level: 'A',
                        percentage: settings.commissionPercentA,
                        amountEarned: aCommission,
                        sourceTask: taskCompletion.id
                    });
                    const walletField = `${settings.commissionWallet || 'income'}Wallet`;
                    aLevelUser[walletField] = parseFloat(aLevelUser[walletField]) + aCommission;
                    await aLevelUser.save(options);
                }
            }

            // B-level (referrer's referrer)
            if (aLevelUser.referrerId) {
                const bLevelUser = await User.findByPk(aLevelUser.referrerId, options);
                if (bLevelUser) {
                    const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                    if (user.membershipLevel !== 'Intern' && userLevel <= bLevelOrder) {
                        const bCommission = earningsAmount * (parseFloat(settings.commissionPercentB) / 100);
                        commissions.push({
                            user: bLevelUser.id,
                            downlineUser: user.id,
                            level: 'B',
                            percentage: settings.commissionPercentB,
                            amountEarned: bCommission,
                            sourceTask: taskCompletion.id
                        });
                        const walletField = `${settings.commissionWallet || 'income'}Wallet`;
                        bLevelUser[walletField] = parseFloat(bLevelUser[walletField]) + bCommission;
                        await bLevelUser.save(options);

                        // C-level (B-level's referrer)
                        if (bLevelUser.referrerId) {
                            const cLevelUser = await User.findByPk(bLevelUser.referrerId, options);
                            if (cLevelUser) {
                                const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                if (user.membershipLevel !== 'Intern' && userLevel <= cLevelOrder) {
                                    const cCommission = earningsAmount * (parseFloat(settings.commissionPercentC) / 100);
                                    commissions.push({
                                        user: cLevelUser.id,
                                        downlineUser: user.id,
                                        level: 'C',
                                        percentage: settings.commissionPercentC,
                                        amountEarned: cCommission,
                                        sourceTask: taskCompletion.id
                                    });
                                    const walletField = `${settings.commissionWallet || 'income'}Wallet`;
                                    cLevelUser[walletField] = parseFloat(cLevelUser[walletField]) + cCommission;
                                    await cLevelUser.save(options);
                                }
                            }
                        }
                    }
                }
            }
        }

        if (commissions.length > 0) {
            await Commission.bulkCreate(commissions, options);
            logger.info('Task commissions created', { count: commissions.length, taskId: taskCompletion.id });
        }

        return commissions;
    } catch (error) {
        logger.error('Error calculating task commissions:', { error: error.message, stack: error.stack });
        throw error;
    }
};

/**
 * Calculate commissions for membership purchases
 */
exports.calculateAndCreateMembershipCommissions = async (user, newMembership, options = {}) => {
    try {
        if (!user.referrerId || newMembership.level === 'Intern') {
            return [];
        }

        const settings = await getSettings(options);
        const memberships = await Membership.findAll({
            order: [['order', 'ASC']],
            ...options
        });

        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        const purchaseOrder = newMembership.order;
        const commissions = [];

        // A-level (direct referrer)
        const aLevelUser = await User.findByPk(user.referrerId, options);
        if (aLevelUser) {
            // Check maxReferralsPerUser limit if set
            let canEarnA = true;
            if (settings.maxReferralsPerUser > 0) {
                const referralCount = await User.count({
                    where: { referrerId: aLevelUser.id },
                    ...options
                });
                if (referralCount > settings.maxReferralsPerUser) {
                    canEarnA = false;
                }
            }

            if (canEarnA) {
                const aLevelOrder = membershipOrder[aLevelUser.membershipLevel];
                if (newMembership.level !== 'Intern' && purchaseOrder <= aLevelOrder) {
                    const commissionPercent = settings.upgradeCommissionPercentA || settings.commissionPercentA;
                    const aCommission = parseFloat(newMembership.price) * (parseFloat(commissionPercent) / 100);
                    commissions.push({
                        user: aLevelUser.id,
                        downlineUser: user.id,
                        level: 'A',
                        percentage: commissionPercent,
                        amountEarned: aCommission,
                        sourceMembership: newMembership.level
                    });
                    const walletField = `${settings.commissionWallet || 'income'}Wallet`;
                    aLevelUser[walletField] = parseFloat(aLevelUser[walletField]) + aCommission;
                    await aLevelUser.save(options);
                }
            }

            // B-level
            if (aLevelUser.referrerId) {
                const bLevelUser = await User.findByPk(aLevelUser.referrerId, options);
                if (bLevelUser) {
                    const bLevelOrder = membershipOrder[bLevelUser.membershipLevel];
                    if (newMembership.level !== 'Intern' && purchaseOrder <= bLevelOrder) {
                        const commissionPercent = settings.upgradeCommissionPercentB || settings.commissionPercentB;
                        const bCommission = parseFloat(newMembership.price) * (parseFloat(commissionPercent) / 100);
                        commissions.push({
                            user: bLevelUser.id,
                            downlineUser: user.id,
                            level: 'B',
                            percentage: commissionPercent,
                            amountEarned: bCommission,
                            sourceMembership: newMembership.level
                        });
                        const walletField = `${settings.commissionWallet || 'income'}Wallet`;
                        bLevelUser[walletField] = parseFloat(bLevelUser[walletField]) + bCommission;
                        await bLevelUser.save(options);

                        // C-level
                        if (bLevelUser.referrerId) {
                            const cLevelUser = await User.findByPk(bLevelUser.referrerId, options);
                            if (cLevelUser) {
                                const cLevelOrder = membershipOrder[cLevelUser.membershipLevel];
                                if (newMembership.level !== 'Intern' && purchaseOrder <= cLevelOrder) {
                                    const commissionPercent = settings.upgradeCommissionPercentC || settings.commissionPercentC;
                                    const cCommission = parseFloat(newMembership.price) * (parseFloat(commissionPercent) / 100);
                                    commissions.push({
                                        user: cLevelUser.id,
                                        downlineUser: user.id,
                                        level: 'C',
                                        percentage: commissionPercent,
                                        amountEarned: cCommission,
                                        sourceMembership: newMembership.level
                                    });
                                    const walletField = `${settings.commissionWallet || 'income'}Wallet`;
                                    cLevelUser[walletField] = parseFloat(cLevelUser[walletField]) + cCommission;
                                    await cLevelUser.save(options);
                                }
                            }
                        }
                    }
                }
            }
        }

        if (commissions.length > 0) {
            await Commission.bulkCreate(commissions, options);
            logger.info('Membership commissions created', { count: commissions.length, userId: user.id, level: newMembership.level });
        }

        return commissions;
    } catch (error) {
        logger.error('Error calculating membership commissions:', { error: error.message, stack: error.stack });
        throw error;
    }
};

