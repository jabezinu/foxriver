const SlotTier = require('../models/SlotTier');

// @desc    Get all slot tiers (for users - only active)
// @route   GET /api/slot-tiers
// @access  Public
exports.getActiveTiers = async (req, res) => {
    try {
        const tiers = await SlotTier.find({ isActive: true }).sort({ order: 1 });

        res.status(200).json({
            success: true,
            data: tiers
        });
    } catch (error) {
        console.error('Get active tiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching slot tiers',
            error: error.message
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
            data: tiers
        });
    } catch (error) {
        console.error('Get all tiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching slot tiers',
            error: error.message
        });
    }
};

// @desc    Create new slot tier
// @route   POST /api/slot-tiers/admin
// @access  Private/Admin
exports.createTier = async (req, res) => {
    try {
        const { name, betAmount, winAmount, winProbability, description, order } = req.body;

        const tier = await SlotTier.create({
            name,
            betAmount,
            winAmount,
            winProbability: winProbability || 10,
            description,
            order: order || 0
        });

        res.status(201).json({
            success: true,
            data: tier
        });
    } catch (error) {
        console.error('Create tier error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating slot tier',
            error: error.message
        });
    }
};

// @desc    Update slot tier
// @route   PUT /api/slot-tiers/admin/:id
// @access  Private/Admin
exports.updateTier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, betAmount, winAmount, winProbability, isActive, description, order } = req.body;

        const tier = await SlotTier.findByIdAndUpdate(
            id,
            { name, betAmount, winAmount, winProbability, isActive, description, order },
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
            data: tier
        });
    } catch (error) {
        console.error('Update tier error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating slot tier',
            error: error.message
        });
    }
};

// @desc    Delete slot tier
// @route   DELETE /api/slot-tiers/admin/:id
// @access  Private/Admin
exports.deleteTier = async (req, res) => {
    try {
        const { id } = req.params;

        const tier = await SlotTier.findByIdAndDelete(id);

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
        console.error('Delete tier error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting slot tier',
            error: error.message
        });
    }
};

// @desc    Toggle tier active status
// @route   PATCH /api/slot-tiers/admin/:id/toggle
// @access  Private/Admin
exports.toggleTierStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const tier = await SlotTier.findById(id);

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
            data: tier
        });
    } catch (error) {
        console.error('Toggle tier status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling tier status',
            error: error.message
        });
    }
};
