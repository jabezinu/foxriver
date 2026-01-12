const Membership = require('../models/Membership');
const User = require('../models/User');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');

// @desc    Get all membership tiers
// @route   GET /api/memberships/tiers
// @access  Public
exports.getTiers = async (req, res) => {
    try {
        // Filter out hidden memberships for regular users
        // Include memberships where hidden is false OR doesn't exist (for backward compatibility)
        const memberships = await Membership.find({ 
            $or: [{ hidden: false }, { hidden: { $exists: false } }] 
        }).sort({ order: 1 });

        const tiersWithDetails = memberships.map(membership => ({
            level: membership.level,
            price: membership.price,
            canWithdraw: membership.canWithdraw,
            canUseTransactionPassword: membership.canUseTransactionPassword,
            dailyIncome: membership.getDailyIncome(),
            perVideoIncome: membership.getPerVideoIncome(),
            fourDayIncome: membership.getFourDayIncome(),
            dailyTasks: 4
        }));

        res.status(200).json({
            success: true,
            count: tiersWithDetails.length,
            tiers: tiersWithDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Upgrade membership (deducts from selected wallet)
// @route   POST /api/memberships/upgrade
// @access  Private
exports.upgradeMembership = async (req, res) => {
    try {
        const { newLevel, walletType } = req.body;

        // Validate wallet type
        if (!['income', 'personal'].includes(walletType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wallet type selected'
            });
        }

        const user = await User.findById(req.user.id);
        const currentMembership = await Membership.findOne({ level: user.membershipLevel });
        const newMembership = await Membership.findOne({ level: newLevel });

        if (!newMembership) {
            return res.status(404).json({
                success: false,
                message: 'Membership level not found'
            });
        }

        // Check if upgrade is valid (can only upgrade to higher level or strictly higher?) 
        // Logic says "Upgrade", so strictly higher makes sense, but sometimes users might just want to pay to change. 
        // Based on previous code: newMembership.order <= currentMembership.order check exists. 
        // I will keep the check.
        if (newMembership.order <= currentMembership.order) {
            return res.status(400).json({
                success: false,
                message: 'Can only upgrade to a higher membership level'
            });
        }

        // Check rank progression restrictions
        const progressionCheck = await Membership.isProgressionAllowed(user.membershipLevel, newLevel);
        if (!progressionCheck.allowed) {
            return res.status(400).json({
                success: false,
                message: progressionCheck.reason
            });
        }

        // Check Balance
        const walletField = walletType === 'income' ? 'incomeWallet' : 'personalWallet';
        if (user[walletField] < newMembership.price) {
            return res.status(400).json({
                success: false,
                message: `Insufficient funds in ${walletType} wallet`
            });
        }

        // Deduct funds
        user[walletField] -= newMembership.price;

        // Update Level and reset activation date
        user.membershipLevel = newLevel;
        user.membershipActivatedAt = new Date(); // Reset activation date for new membership
        await user.save();

        // Calculate and credit membership commissions
        await calculateAndCreateMembershipCommissions(user, newMembership);

        res.status(200).json({
            success: true,
            message: `Successfully upgraded to ${newLevel}`,
            user: {
                membershipLevel: user.membershipLevel,
                incomeWallet: user.incomeWallet,
                personalWallet: user.personalWallet
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all membership tiers (including hidden) - Admin only
// @route   GET /api/memberships/admin/all
// @access  Private/Admin
exports.getAllTiers = async (req, res) => {
    try {
        const memberships = await Membership.find().sort({ order: 1 });

        const tiersWithDetails = memberships.map(membership => ({
            _id: membership._id,
            level: membership.level,
            price: membership.price,
            canWithdraw: membership.canWithdraw,
            canUseTransactionPassword: membership.canUseTransactionPassword,
            order: membership.order,
            hidden: membership.hidden,
            dailyIncome: membership.getDailyIncome(),
            perVideoIncome: membership.getPerVideoIncome(),
            fourDayIncome: membership.getFourDayIncome(),
            dailyTasks: 4
        }));

        res.status(200).json({
            success: true,
            count: tiersWithDetails.length,
            tiers: tiersWithDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Hide memberships by rank range
// @route   PUT /api/memberships/admin/hide-range
// @access  Private/Admin
exports.hideMembershipsByRange = async (req, res) => {
    try {
        const { startRank, endRank } = req.body;

        // Validate input
        if (!startRank || !endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank and end rank are required'
            });
        }

        if (startRank < 1 || startRank > 10 || endRank < 1 || endRank > 10) {
            return res.status(400).json({
                success: false,
                message: 'Ranks must be between 1 and 10'
            });
        }

        if (startRank > endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank must be less than or equal to end rank'
            });
        }

        // Build level array for the range
        const levels = [];
        for (let i = startRank; i <= endRank; i++) {
            levels.push(`Rank ${i}`);
        }

        // Update memberships
        const result = await Membership.updateMany(
            { level: { $in: levels } },
            { $set: { hidden: true } }
        );

        res.status(200).json({
            success: true,
            message: `Successfully hidden memberships from Rank ${startRank} to Rank ${endRank}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Unhide memberships by rank range
// @route   PUT /api/memberships/admin/unhide-range
// @access  Private/Admin
exports.unhideMembershipsByRange = async (req, res) => {
    try {
        const { startRank, endRank } = req.body;

        // Validate input
        if (!startRank || !endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank and end rank are required'
            });
        }

        if (startRank < 1 || startRank > 10 || endRank < 1 || endRank > 10) {
            return res.status(400).json({
                success: false,
                message: 'Ranks must be between 1 and 10'
            });
        }

        if (startRank > endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank must be less than or equal to end rank'
            });
        }

        // Build level array for the range
        const levels = [];
        for (let i = startRank; i <= endRank; i++) {
            levels.push(`Rank ${i}`);
        }

        // Update memberships
        const result = await Membership.updateMany(
            { level: { $in: levels } },
            { $set: { hidden: false } }
        );

        res.status(200).json({
            success: true,
            message: `Successfully unhidden memberships from Rank ${startRank} to Rank ${endRank}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Set restricted rank progression range
// @route   PUT /api/memberships/admin/set-restricted-range
// @access  Private/Admin
exports.setRestrictedRange = async (req, res) => {
    try {
        const { startRank, endRank } = req.body;

        // Validate input
        if (!startRank || !endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank and end rank are required'
            });
        }

        if (startRank < 1 || startRank > 10 || endRank < 1 || endRank > 10) {
            return res.status(400).json({
                success: false,
                message: 'Ranks must be between 1 and 10'
            });
        }

        if (startRank > endRank) {
            return res.status(400).json({
                success: false,
                message: 'Start rank must be less than or equal to end rank'
            });
        }

        if (endRank - startRank < 1) {
            return res.status(400).json({
                success: false,
                message: 'Restricted range must include at least 2 ranks'
            });
        }

        // Store the restriction in the Intern membership document
        await Membership.updateOne(
            { level: 'Intern' },
            { 
                $set: { 
                    restrictedRangeStart: startRank,
                    restrictedRangeEnd: endRank
                } 
            }
        );

        res.status(200).json({
            success: true,
            message: `Sequential progression is now required from Rank ${startRank} to Rank ${endRank}`,
            restrictedRange: {
                start: startRank,
                end: endRank
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get restricted rank progression range
// @route   GET /api/memberships/admin/restricted-range
// @access  Private/Admin
exports.getRestrictedRange = async (req, res) => {
    try {
        const restrictedRange = await Membership.getRestrictedRange();

        res.status(200).json({
            success: true,
            restrictedRange: restrictedRange || null,
            message: restrictedRange 
                ? `Sequential progression required from Rank ${restrictedRange.start} to Rank ${restrictedRange.end}`
                : 'No rank progression restrictions are currently set'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Clear restricted rank progression range
// @route   DELETE /api/memberships/admin/restricted-range
// @access  Private/Admin
exports.clearRestrictedRange = async (req, res) => {
    try {
        // Clear the restriction from the Intern membership document
        await Membership.updateOne(
            { level: 'Intern' },
            { 
                $set: { 
                    restrictedRangeStart: null,
                    restrictedRangeEnd: null
                } 
            }
        );

        res.status(200).json({
            success: true,
            message: 'Rank progression restrictions have been cleared. Users can now skip ranks freely.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update membership price
// @route   PUT /api/memberships/admin/update-price/:id
// @access  Private/Admin
exports.updateMembershipPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        // Validate price
        if (price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: 'Price is required'
            });
        }

        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

        // Find and update membership
        const membership = await Membership.findById(id);
        
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership level not found'
            });
        }

        // Prevent changing Intern price from 0
        if (membership.level === 'Intern' && price !== 0) {
            return res.status(400).json({
                success: false,
                message: 'Intern membership must remain free (price = 0)'
            });
        }

        membership.price = price;
        await membership.save();

        res.status(200).json({
            success: true,
            message: `Successfully updated ${membership.level} price to ${price} ETB`,
            membership: {
                _id: membership._id,
                level: membership.level,
                price: membership.price,
                dailyIncome: membership.getDailyIncome(),
                perVideoIncome: membership.getPerVideoIncome(),
                fourDayIncome: membership.getFourDayIncome()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Bulk update membership prices
// @route   PUT /api/memberships/admin/bulk-update-prices
// @access  Private/Admin
exports.bulkUpdatePrices = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, price }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const { id, price } = update;

                if (!id || price === undefined || price === null) {
                    errors.push({ id, error: 'Missing id or price' });
                    continue;
                }

                if (price < 0) {
                    errors.push({ id, error: 'Price cannot be negative' });
                    continue;
                }

                const membership = await Membership.findById(id);
                
                if (!membership) {
                    errors.push({ id, error: 'Membership not found' });
                    continue;
                }

                // Prevent changing Intern price from 0
                if (membership.level === 'Intern' && price !== 0) {
                    errors.push({ id, error: 'Intern membership must remain free' });
                    continue;
                }

                membership.price = price;
                await membership.save();

                results.push({
                    id: membership._id,
                    level: membership.level,
                    price: membership.price
                });
            } catch (err) {
                errors.push({ id: update.id, error: err.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully updated ${results.length} membership price(s)`,
            updated: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
