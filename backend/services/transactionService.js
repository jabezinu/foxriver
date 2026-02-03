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
                        amountUsedForUpgrade: deposit.amount
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
     * Note: Amount is already deducted when request was created
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

        // No wallet deduction needed - amount was already deducted when request was created
        // Just update withdrawal status
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
     * Note: Amount was deducted when request was created, so we need to refund it
     */
    async rejectWithdrawal(withdrawalId, notes = '') {
        const withdrawal = await Withdrawal.findByPk(withdrawalId);

        if (!withdrawal) {
            throw new AppError('Withdrawal not found', 404);
        }

        if (withdrawal.status === 'rejected') {
            throw new AppError('Withdrawal already rejected', 400);
        }

        if (withdrawal.status === 'approved') {
            throw new AppError('Cannot reject an approved withdrawal. Use undo instead.', 400);
        }

        const user = await User.findByPk(withdrawal.user);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        await sequelize.transaction(async (t) => {
            // Refund the deducted amount back to user's wallet
            const walletField = withdrawal.walletType === 'income' || withdrawal.walletType === 'tasks' ? 'incomeWallet' : 'personalWallet';

            user[walletField] = parseFloat(user[walletField]) + parseFloat(withdrawal.amount);
            await user.save({ transaction: t });

            // Update withdrawal status
            withdrawal.status = 'rejected';
            withdrawal.adminNotes = notes;
            await withdrawal.save({ transaction: t });
        });

        logger.info('Withdrawal rejected and amount refunded', { withdrawalId, notes, amount: withdrawal.amount, userId: user.id });
        return withdrawal;
    }

    /**
     * Undo a deposit (revert approved/rejected to pending/submitted)
     */
    async undoDeposit(depositId) {
        const deposit = await Deposit.findByPk(depositId, {
            include: [{ model: RankUpgradeRequest, as: 'rankUpgradeRequest' }]
        });

        if (!deposit) throw new AppError('Deposit not found', 404);
        if (deposit.status === 'pending' || deposit.status === 'ft_submitted') {
            throw new AppError('Deposit is already in a pending state', 400);
        }

        const user = await User.findByPk(deposit.user);
        if (!user) throw new AppError('User not found', 404);

        await sequelize.transaction(async (t) => {
            if (deposit.status === 'approved') {
                const isRankUpgrade = deposit.rankUpgradeRequest;

                if (!isRankUpgrade) {
                    // Reverse regular balance credit
                    user.personalWallet = parseFloat(user.personalWallet) - parseFloat(deposit.amount);
                    await user.save({ transaction: t });
                } else {
                    // Reverse rank upgrade
                    const request = deposit.rankUpgradeRequest;

                    // Revert user level to what it was before this upgrade
                    // Note: This logic assumes the upgrade was from request.currentLevel
                    user.membershipLevel = request.currentLevel;
                    await user.save({ transaction: t });

                    // Revert upgrade request status
                    request.status = 'pending';
                    request.approvedBy = null;
                    request.approvedAt = null;
                    await request.save({ transaction: t });

                    // Delete commissions generated for this upgrade
                    const { Commission } = require('../models');
                    await Commission.destroy({
                        where: {
                            downlineUser: user.id,
                            sourceMembership: request.requestedLevel,
                            createdAt: { [Op.gte]: request.updatedAt } // Safety check
                        },
                        transaction: t
                    });
                }
            }

            // Reset deposit status
            deposit.status = 'ft_submitted';
            deposit.approvedBy = null;
            deposit.approvedAt = null;
            await deposit.save({ transaction: t });
        });

        logger.info('Deposit undo successful', { depositId, previousStatus: deposit.status });
        return deposit;
    }

    /**
     * Undo a withdrawal (revert approved/rejected to pending)
     * Note: With new logic, amount is deducted on creation, so:
     * - If approved: amount is still deducted (no change on approval), so refund it
     * - If rejected: amount was already refunded on rejection, so deduct it again
     */
    async undoWithdrawal(withdrawalId) {
        const withdrawal = await Withdrawal.findByPk(withdrawalId);
        if (!withdrawal) throw new AppError('Withdrawal not found', 404);
        if (withdrawal.status === 'pending') throw new AppError('Withdrawal is already pending', 400);

        const user = await User.findByPk(withdrawal.user);
        if (!user) throw new AppError('User not found', 404);

        await sequelize.transaction(async (t) => {
            const walletField = withdrawal.walletType === 'income' || withdrawal.walletType === 'tasks' ? 'incomeWallet' : 'personalWallet';

            if (withdrawal.status === 'approved') {
                // Amount was deducted on creation and never refunded
                // Refund it to restore to pending state (where amount should be deducted)
                user[walletField] = parseFloat(user[walletField]) + parseFloat(withdrawal.amount);
                await user.save({ transaction: t });
            } else if (withdrawal.status === 'rejected') {
                // Amount was refunded on rejection
                // Deduct it again to restore to pending state (where amount should be deducted)
                if (parseFloat(user[walletField]) < parseFloat(withdrawal.amount)) {
                    throw new AppError('Insufficient balance to undo rejection', 400);
                }
                user[walletField] = parseFloat(user[walletField]) - parseFloat(withdrawal.amount);
                await user.save({ transaction: t });
            }

            // Reset withdrawal status
            withdrawal.status = 'pending';
            withdrawal.approvedBy = null;
            withdrawal.approvedAt = null;
            await withdrawal.save({ transaction: t });
        });

        logger.info('Withdrawal undo successful', { withdrawalId, previousStatus: withdrawal.status });
        return withdrawal;
    }
}

module.exports = new TransactionService();
