const { Deposit, Withdrawal, User, RankUpgradeRequest, Membership, sequelize } = require('../models');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class TransactionService {
    /**
     * Approve a deposit request
     */
    async approveDeposit(depositId, adminId, notes = '') {
        const deposit = await Deposit.findByPk(depositId, {
            include: [
                {
                    model: RankUpgradeRequest,
                    as: 'rankUpgradeRequest'
                }
            ]
        });

        if (!deposit) {
            throw new AppError('Deposit not found', 404);
        }

        if (deposit.status === 'approved') {
            throw new AppError('Deposit already approved', 400);
        }

        const user = await User.findByPk(deposit.user);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Use transaction to ensure atomicity
        await sequelize.transaction(async (t) => {
            // Check if this deposit is for a rank upgrade
            const isRankUpgradeDeposit = deposit.rankUpgradeRequest && deposit.rankUpgradeRequest.status === 'pending';
            
            // Only credit user's personal balance if this is NOT a rank upgrade deposit
            if (!isRankUpgradeDeposit) {
                user.personalWallet = parseFloat(user.personalWallet) + parseFloat(deposit.amount);
                await user.save({ transaction: t });
                logger.info('Regular deposit - credited to personal wallet', { depositId, amount: deposit.amount });
            } else {
                logger.info('Rank upgrade deposit - amount used for upgrade, not credited to wallet', { depositId, amount: deposit.amount });
            }

            // Update deposit status
            deposit.status = 'approved';
            deposit.approvedBy = adminId;
            deposit.approvedAt = new Date();
            deposit.adminNotes = notes;
            await deposit.save({ transaction: t });

            // If this deposit is associated with a rank upgrade request, approve it automatically
            if (isRankUpgradeDeposit) {
                const rankUpgradeRequest = deposit.rankUpgradeRequest;
                
                // Get the target membership
                const newMembership = await Membership.findOne({
                    where: { level: rankUpgradeRequest.requestedLevel }
                });

                if (newMembership) {
                    // Calculate rank upgrade bonus (dynamic percentage for Rank 2 and above)
                    let upgradeBonus = 0;
                    const getCurrentRankNumber = (level) => {
                        if (level === 'Intern') return 0;
                        const match = level.match(/Rank (\d+)/);
                        return match ? parseInt(match[1]) : 0;
                    };

                    const targetRankNumber = getCurrentRankNumber(rankUpgradeRequest.requestedLevel);
                    
                    // Apply dynamic bonus only from Rank 2 and above (not for Intern → Rank 1)
                    if (targetRankNumber >= 2) {
                        // Get dynamic bonus percentage from system settings
                        const { SystemSetting } = require('../models');
                        const settings = await SystemSetting.findOne();
                        const bonusPercent = settings?.rankUpgradeBonusPercent || 15.00;
                        
                        upgradeBonus = parseFloat(deposit.amount) * (parseFloat(bonusPercent) / 100);
                        user.incomeWallet = parseFloat(user.incomeWallet) + upgradeBonus;
                        logger.info('Rank upgrade bonus applied', {
                            userId: user.id,
                            targetRank: rankUpgradeRequest.requestedLevel,
                            upgradeAmount: deposit.amount,
                            bonusPercent: bonusPercent,
                            bonusAmount: upgradeBonus
                        });
                    } else {
                        logger.info('No bonus applied for upgrade to Rank 1', {
                            userId: user.id,
                            targetRank: rankUpgradeRequest.requestedLevel
                        });
                    }

                    // Update user's membership level
                    user.membershipLevel = rankUpgradeRequest.requestedLevel;
                    user.membershipActivatedAt = new Date();
                    await user.save({ transaction: t });

                    // Update rank upgrade request status
                    rankUpgradeRequest.status = 'approved';
                    rankUpgradeRequest.approvedBy = adminId;
                    rankUpgradeRequest.approvedAt = new Date();
                    await rankUpgradeRequest.save({ transaction: t });

                    // Calculate and create membership commissions
                    await calculateAndCreateMembershipCommissions(user, newMembership, { transaction: t });

                    logger.info('Rank upgrade approved automatically with deposit', {
                        depositId,
                        rankUpgradeRequestId: rankUpgradeRequest.id,
                        userId: user.id,
                        newLevel: rankUpgradeRequest.requestedLevel,
                        amountUsedForUpgrade: deposit.amount,
                        bonusApplied: upgradeBonus
                    });
                }
            }
        });

        const depositType = deposit.rankUpgradeRequest ? 'rank upgrade' : 'regular';
        logger.info(`${depositType} deposit approved`, { 
            depositId, 
            adminId, 
            amount: deposit.amount, 
            userId: user.id,
            creditedToWallet: !deposit.rankUpgradeRequest
        });
        return deposit;
    }

    /**
     * Reject a deposit request
     */
    async rejectDeposit(depositId, notes = '') {
        const deposit = await Deposit.findByPk(depositId);

        if (!deposit) {
            throw new AppError('Deposit not found', 404);
        }

        deposit.status = 'rejected';
        deposit.adminNotes = notes;
        await deposit.save();

        logger.info('Deposit rejected', { depositId, notes });
        return deposit;
    }

    /**
     * Approve a withdrawal request
     */
    async approveWithdrawal(withdrawalId, adminId, notes = '') {
        const withdrawal = await Withdrawal.findByPk(withdrawalId);

        if (!withdrawal) {
            throw new AppError('Withdrawal not found', 404);
        }

        if (withdrawal.status === 'approved') {
            throw new AppError('Withdrawal already approved', 400);
        }

        const user = await User.findByPk(withdrawal.user);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Deduct from user's balance
        const walletField = withdrawal.walletType === 'income' ? 'incomeWallet' : 'personalWallet';

        if (parseFloat(user[walletField]) < parseFloat(withdrawal.amount)) {
            throw new AppError('Insufficient balance in user wallet', 400);
        }

        user[walletField] = parseFloat(user[walletField]) - parseFloat(withdrawal.amount);
        await user.save();

        // Update withdrawal status
        withdrawal.status = 'approved';
        withdrawal.approvedBy = adminId;
        withdrawal.approvedAt = new Date();
        withdrawal.adminNotes = notes;
        await withdrawal.save();

        logger.info('Withdrawal approved', { withdrawalId, adminId, amount: withdrawal.amount, userId: user.id });
        return withdrawal;
    }

    /**
     * Reject a withdrawal request
     */
    async rejectWithdrawal(withdrawalId, notes = '') {
        const withdrawal = await Withdrawal.findByPk(withdrawalId);

        if (!withdrawal) {
            throw new AppError('Withdrawal not found', 404);
        }

        withdrawal.status = 'rejected';
        withdrawal.adminNotes = notes;
        await withdrawal.save();

        logger.info('Withdrawal rejected', { withdrawalId, notes });
        return withdrawal;
    }
}

module.exports = new TransactionService();
