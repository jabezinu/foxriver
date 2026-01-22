/**
 * User Service Layer
 * Contains business logic for user operations
 */

const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class UserService {
    /**
     * Find user by ID with optional field selection
     */
    async findById(userId, selectFields = '') {
        const attributes = selectFields ? selectFields.split(' ') : undefined;
        const user = await User.findByPk(userId, { attributes, raw: true });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    /**
     * Find user by phone number
     */
    async findByPhone(phone) {
        return await User.findOne({ where: { phone }, raw: true });
    }

    /**
     * Update user wallet balance
     */
    async updateWallet(userId, type, amount) {
        const field = type === 'income' ? 'incomeWallet' : 'personalWallet';
        const user = await User.findByPk(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        user[field] = parseFloat(user[field]) + parseFloat(amount);
        await user.save();

        logger.info('Wallet updated', { userId, type, amount, newBalance: user[field] });
        return { incomeWallet: user.incomeWallet, personalWallet: user.personalWallet };
    }

    /**
     * Check if bank account is already registered
     */
    async isBankAccountDuplicate(accountNumber, bank, excludeUserId = null) {
        const { sequelize } = require('../config/database');

        let query = `
            SELECT id FROM users 
            WHERE (
                JSON_EXTRACT(bankAccount, '$.accountNumber') = :accountNumber 
                AND JSON_EXTRACT(bankAccount, '$.bank') = :bank
            ) OR (
                JSON_EXTRACT(pendingBankAccount, '$.accountNumber') = :accountNumber 
                AND JSON_EXTRACT(pendingBankAccount, '$.bank') = :bank
            )
        `;

        const replacements = { accountNumber, bank };

        if (excludeUserId) {
            query += ' AND id != :excludeUserId';
            replacements.excludeUserId = excludeUserId;
        }

        const [results] = await sequelize.query(query, { replacements });
        return results.length > 0;
    }

    /**
     * Get user's referral statistics
     */
    async getReferralStats(userId) {
        const directReferrals = await User.count({ where: { referrerId: userId } });

        // Get all direct referrals
        const referrals = await User.findAll({
            where: { referrerId: userId },
            attributes: ['id', 'membershipLevel', 'createdAt'],
            raw: true
        });

        // Count by membership level
        const byLevel = referrals.reduce((acc, ref) => {
            acc[ref.membershipLevel] = (acc[ref.membershipLevel] || 0) + 1;
            return acc;
        }, {});

        return {
            total: directReferrals,
            byLevel,
            referrals
        };
    }

    /**
     * Get user's downline (A, B, C levels)
     */
    async getDownline(userId) {
        // A-level (direct referrals)
        const aLevel = await User.findAll({
            where: { referrerId: userId },
            attributes: ['id', 'phone', 'membershipLevel', 'createdAt'],
            raw: true
        });

        // B-level (referrals of referrals)
        const aLevelIds = aLevel.map(u => u.id);
        const bLevel = aLevelIds.length > 0 ? await User.findAll({
            where: { referrerId: { [Op.in]: aLevelIds } },
            attributes: ['id', 'phone', 'membershipLevel', 'createdAt', 'referrerId'],
            raw: true
        }) : [];

        // C-level (referrals of B-level)
        const bLevelIds = bLevel.map(u => u.id);
        const cLevel = bLevelIds.length > 0 ? await User.findAll({
            where: { referrerId: { [Op.in]: bLevelIds } },
            attributes: ['id', 'phone', 'membershipLevel', 'createdAt', 'referrerId'],
            raw: true
        }) : [];

        return {
            aLevel,
            bLevel,
            cLevel,
            total: aLevel.length + bLevel.length + cLevel.length
        };
    }

    /**
     * Check if user can perform withdrawal
     */
    async canWithdraw(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['withdrawalRestrictedUntil'],
            raw: true
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.withdrawalRestrictedUntil && new Date() < new Date(user.withdrawalRestrictedUntil)) {
            const restrictedUntil = new Date(user.withdrawalRestrictedUntil).toLocaleDateString();
            throw new AppError(`Withdrawal restricted until ${restrictedUntil}`, 403);
        }

        return true;
    }

    /**
     * Restrict user withdrawal for specified days
     */
    async restrictWithdrawal(userId, days) {
        const restrictedUntil = new Date();
        restrictedUntil.setDate(restrictedUntil.getDate() + days);

        await User.update(
            { withdrawalRestrictedUntil: restrictedUntil },
            { where: { id: userId } }
        );

        logger.info('Withdrawal restricted', { userId, days, until: restrictedUntil });
    }
    /**
     * Update user profile data
     */
    async updateProfile(userId, data) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (data.name) {
            user.name = data.name.trim();
        }

        await user.save();
        return user;
    }

    /**
     * Process pending bank account change - check if user needs to confirm
     */
    async processPendingBankChange(user) {
        if (user.bankChangeStatus !== 'pending') return { needsConfirmation: false };

        // Ensure confirmations is always an array
        const confirmations = Array.isArray(user.bankChangeConfirmations) ? user.bankChangeConfirmations : [];
        const today = new Date().toDateString();

        // Check if user already confirmed today
        const confirmedToday = confirmations.some(conf => 
            conf && conf.date && new Date(conf.date).toDateString() === today
        );

        // Check if all 3 confirmations are complete
        if (confirmations.length >= 3) {
            try {
                const isDuplicate = await this.isBankAccountDuplicate(
                    user.pendingBankAccount.accountNumber,
                    user.pendingBankAccount.bank,
                    user.id
                );

                if (!isDuplicate) {
                    user.bankAccount = {
                        ...user.pendingBankAccount,
                        isSet: true
                    };
                    user.bankChangeStatus = 'none';
                    user.pendingBankAccount = null;
                    user.bankChangeRequestDate = null;
                    user.bankChangeConfirmations = [];
                    await user.save();
                    logger.info('Bank account change approved after 3 confirmations', { userId: user.id });
                    return { needsConfirmation: false, completed: true };
                }
            } catch (error) {
                logger.error('Error processing bank change completion:', error);
                // Continue with normal flow if there's an error
            }
        }

        return { 
            needsConfirmation: !confirmedToday && confirmations.length < 3,
            confirmationCount: confirmations.length,
            confirmedToday,
            oldAccount: user.bankAccount,
            newAccount: user.pendingBankAccount
        };
    }

    /**
     * Confirm bank account change for today
     */
    async confirmBankChange(userId, confirmed) {
        const user = await User.findByPk(userId);
        
        if (!user || user.bankChangeStatus !== 'pending') {
            throw new AppError('No pending bank account change found', 404);
        }

        // Ensure confirmations is always an array
        const confirmations = Array.isArray(user.bankChangeConfirmations) ? user.bankChangeConfirmations : [];
        const today = new Date().toDateString();

        // Check if already confirmed today
        const confirmedToday = confirmations.some(conf => 
            conf && conf.date && new Date(conf.date).toDateString() === today
        );

        if (confirmedToday) {
            throw new AppError('You have already confirmed today', 400);
        }

        if (!confirmed) {
            // User declined - reset the change request
            user.bankChangeStatus = 'declined';
            user.pendingBankAccount = null;
            user.bankChangeRequestDate = null;
            user.bankChangeConfirmations = [];
            await user.save();
            logger.info('Bank account change declined by user', { userId });
            return { declined: true };
        }

        // Add today's confirmation
        confirmations.push({
            date: new Date(),
            confirmed: true
        });

        user.bankChangeConfirmations = confirmations;

        // If this is the 3rd confirmation, apply the change
        if (confirmations.length >= 3) {
            try {
                const isDuplicate = await this.isBankAccountDuplicate(
                    user.pendingBankAccount.accountNumber,
                    user.pendingBankAccount.bank,
                    user.id
                );

                if (isDuplicate) {
                    throw new AppError('This bank account is already registered to another user', 400);
                }

                user.bankAccount = {
                    ...user.pendingBankAccount,
                    isSet: true
                };
                user.bankChangeStatus = 'none';
                user.pendingBankAccount = null;
                user.bankChangeRequestDate = null;
                user.bankChangeConfirmations = [];
                logger.info('Bank account change completed after 3 confirmations', { userId });
                await user.save();
                return { completed: true, confirmationCount: 3 };
            } catch (error) {
                logger.error('Error completing bank account change:', error);
                throw error;
            }
        }

        await user.save();
        logger.info('Bank account change confirmation recorded', { userId, count: confirmations.length });
        return { confirmed: true, confirmationCount: confirmations.length };
    }

    /**
     * Cancel pending bank account change
     */
    async cancelBankChange(userId) {
        const user = await User.findByPk(userId);
        
        if (!user || (user.bankChangeStatus !== 'pending' && user.bankChangeStatus !== 'declined')) {
            throw new AppError('No pending or declined bank account change found', 404);
        }

        user.bankChangeStatus = 'none';
        user.pendingBankAccount = null;
        user.bankChangeRequestDate = null;
        user.bankChangeConfirmations = [];
        await user.save();
        
        logger.info('Bank account change cancelled by user', { userId });
        return true;
    }
}

module.exports = new UserService();
