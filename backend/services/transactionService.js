const { Deposit, Withdrawal, User } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class TransactionService {
    /**
     * Approve a deposit request
     */
    async approveDeposit(depositId, adminId, notes = '') {
        const deposit = await Deposit.findByPk(depositId);

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

        // Credit user's personal balance
        user.personalWallet = parseFloat(user.personalWallet) + parseFloat(deposit.amount);
        await user.save();

        // Update deposit status
        deposit.status = 'approved';
        deposit.approvedBy = adminId;
        deposit.approvedAt = new Date();
        deposit.adminNotes = notes;
        await deposit.save();

        logger.info('Deposit approved', { depositId, adminId, amount: deposit.amount, userId: user.id });
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
