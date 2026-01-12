/**
 * User Service Layer
 * Contains business logic for user operations
 */

const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class UserService {
    /**
     * Find user by ID with optional field selection
     */
    async findById(userId, selectFields = '') {
        const user = await User.findById(userId).select(selectFields).lean();
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    /**
     * Find user by phone number
     */
    async findByPhone(phone) {
        return await User.findOne({ phone }).lean();
    }

    /**
     * Update user wallet balance
     */
    async updateWallet(userId, type, amount) {
        const field = type === 'income' ? 'incomeWallet' : 'personalWallet';
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { [field]: amount } },
            { new: true, runValidators: true }
        ).select('incomeWallet personalWallet');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        logger.info('Wallet updated', { userId, type, amount, newBalance: user[field] });
        return user;
    }

    /**
     * Check if bank account is already registered
     */
    async isBankAccountDuplicate(accountNumber, bank, excludeUserId = null) {
        const query = {
            $or: [
                { 'bankAccount.accountNumber': accountNumber, 'bankAccount.bank': bank },
                { 'pendingBankAccount.accountNumber': accountNumber, 'pendingBankAccount.bank': bank }
            ]
        };

        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }

        const existingUser = await User.findOne(query).lean();
        return !!existingUser;
    }

    /**
     * Get user's referral statistics
     */
    async getReferralStats(userId) {
        const directReferrals = await User.countDocuments({ referrerId: userId });
        
        // Get all direct referrals
        const referrals = await User.find({ referrerId: userId })
            .select('_id membershipLevel createdAt')
            .lean();

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
        const aLevel = await User.find({ referrerId: userId })
            .select('phone membershipLevel createdAt')
            .lean();

        // B-level (referrals of referrals)
        const aLevelIds = aLevel.map(u => u._id);
        const bLevel = await User.find({ referrerId: { $in: aLevelIds } })
            .select('phone membershipLevel createdAt referrerId')
            .lean();

        // C-level (referrals of B-level)
        const bLevelIds = bLevel.map(u => u._id);
        const cLevel = await User.find({ referrerId: { $in: bLevelIds } })
            .select('phone membershipLevel createdAt referrerId')
            .lean();

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
        const user = await User.findById(userId).select('withdrawalRestrictedUntil').lean();
        
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

        await User.findByIdAndUpdate(userId, {
            withdrawalRestrictedUntil: restrictedUntil
        });

        logger.info('Withdrawal restricted', { userId, days, until: restrictedUntil });
    }
}

module.exports = new UserService();
