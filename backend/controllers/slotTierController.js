const SlotTier = require('../models/SlotTier');

// @desc    Get all slot tiers (for users - only active)
// @route   GET /api/slot-tiers
// @access  Public
exports.getActiveTiers = async (req, res) => {
    try {
        const tiers = await SlotTier.find({ isActive: true }).sort({ order: 1 });

        res.status(200).json({
            success: true,
            count: tiers.length,
            data: tiers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching slot tiers'
        });
    }
};

// @desc    Get all slot tiers (for admin - all tiers)
// @route   GET /api/slot-tiers/admin/all
// @access  Private/Admin
exports.getAllTiers = async (req, res) => {
    try {
        const tiers = await SlotTier.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            count: tiers.length,
            data: tiers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching slot tiers'
        });
    }
};

// @desc    Create new slot tier
// @route   POST /api/slot-tiers/admin
// @access  Private/Admin
exports.createTier = async (req, res) => {
    try {
        const tier = await SlotTier.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Slot tier created successfully',
            data: tier
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error creating slot tier'
        });
    }
};

// @desc    Update slot tier
// @route   PUT /api/slot-tiers/admin/:id
// @access  Private/Admin
exports.updateTier = async (req, res) => {
    try {
        const tier = await SlotTier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!tier) {
            return res.status(404).json({
                success: false,
                message: 'Slot tier not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Slot tier updated successfully',
            data: tier
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error updating slot tier'
        });
    }
};

// @desc    Delete slot tier
// @route   DELETE /api/slot-tiers/admin/:id
// @access  Private/Admin
exports.deleteTier = async (req, res) => {
    try {
        const tier = await SlotTier.findByIdAndDelete(req.params.id);

        if (!tier) {
            return res.status(404).json({
                success: false,
                message: 'Slot tier not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Slot tier deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting slot tier'
        });
    }
};

// @desc    Toggle tier active status
// @route   PATCH /api/slot-tiers/admin/:id/toggle
// @access  Private/Admin
exports.toggleTierStatus = async (req, res) => {
    try {
        const tier = await SlotTier.findById(req.params.id);

        if (!tier) {
            return res.status(404).json({
                success: false,
                message: 'Slot tier not found'
            });
        }

        tier.isActive = !tier.isActive;
        await tier.save();

        res.status(200).json({
            success: true,
            message: `Slot tier ${tier.isActive ? 'activated' : 'deactivated'} successfully`,
            data: tier
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error toggling tier status'
        });
    }
};
