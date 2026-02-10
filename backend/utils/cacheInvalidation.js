const cache = require('./cache');
const { User } = require('../models');
const logger = require('../config/logger');

/**
 * Invalidate referral-related cache for a user and their referral chain
 * @param {number} userId - The user whose referral chain cache should be invalidated
 * @param {Object} options - Options for cache invalidation
 */
const invalidateReferralCache = async (userId, options = {}) => {
    const { includeCommissions = true, includeSalary = true } = options;
    
    if (!userId) return;
    
    try {
        // Always invalidate downline cache
        cache.delete(`downline:${userId}`);
        
        if (includeCommissions) {
            cache.delete(`commissions:${userId}`);
        }
        
        if (includeSalary) {
            cache.delete(`salary:${userId}`);
        }
    } catch (error) {
        logger.error('Error invalidating cache for user', { userId, error: error.message });
    }
};

/**
 * Invalidate referral cache for a user's entire referral chain (A, B, C levels)
 * @param {number} userId - The user whose referrers' cache should be invalidated
 */
const invalidateReferralChainCache = async (userId) => {
    if (!userId) return;
    
    try {
        const user = await User.findByPk(userId, { attributes: ['referrerId'] });
        
        if (user && user.referrerId) {
            // A-level referrer
            await invalidateReferralCache(user.referrerId);
            
            // B-level referrer
            const aLevelReferrer = await User.findByPk(user.referrerId, { attributes: ['referrerId'] });
            if (aLevelReferrer && aLevelReferrer.referrerId) {
                await invalidateReferralCache(aLevelReferrer.referrerId, { includeCommissions: false });
                
                // C-level referrer
                const bLevelReferrer = await User.findByPk(aLevelReferrer.referrerId, { attributes: ['referrerId'] });
                if (bLevelReferrer && bLevelReferrer.referrerId) {
                    await invalidateReferralCache(bLevelReferrer.referrerId, { includeCommissions: false });
                }
            }
        }
    } catch (error) {
        logger.error('Error invalidating referral chain cache for user', { userId, error: error.message });
    }
};

module.exports = {
    invalidateReferralCache,
    invalidateReferralChainCache
};