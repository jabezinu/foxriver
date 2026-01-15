const { SlotTier } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get all slot tiers (for users - only active)
// @route   GET /api/slot-tiers
// @access  Public
exports.getActiveTiers = asyncHandler(async (req, res) => {
    const tiers = await SlotTier.findAll({
        where: { isActive: true },
        order: [['order', 'ASC']]
    });
    res.status(200).json({ success: true, count: tiers.length, data: tiers });
});

// @desc    Get all slot tiers (for admin - all tiers)
// @route   GET /api/slot-tiers/admin/all
// @access  Private/Admin
exports.getAllTiers = asyncHandler(async (req, res) => {
    const tiers = await SlotTier.findAll({ order: [['order', 'ASC']] });
    res.status(200).json({ success: true, count: tiers.length, data: tiers });
});

// @desc    Create new slot tier
// @route   POST /api/slot-tiers/admin
// @access  Private/Admin
exports.createTier = asyncHandler(async (req, res) => {
    const tier = await SlotTier.create(req.body);
    res.status(201).json({ success: true, message: 'Slot tier created', data: tier });
});

// @desc    Update slot tier
// @route   PUT /api/slot-tiers/admin/:id
// @access  Private/Admin
exports.updateTier = asyncHandler(async (req, res) => {
    const tier = await SlotTier.findByPk(req.params.id);
    if (!tier) throw new AppError('Slot tier not found', 404);

    await tier.update(req.body);
    res.status(200).json({ success: true, message: 'Slot tier updated', data: tier });
});

// @desc    Delete slot tier
// @route   DELETE /api/slot-tiers/admin/:id
// @access  Private/Admin
exports.deleteTier = asyncHandler(async (req, res) => {
    const tier = await SlotTier.findByPk(req.params.id);
    if (!tier) throw new AppError('Slot tier not found', 404);

    await tier.destroy();
    res.status(200).json({ success: true, message: 'Slot tier deleted' });
});

// @desc    Toggle tier active status
// @route   PATCH /api/slot-tiers/admin/:id/toggle
// @access  Private/Admin
exports.toggleTierStatus = asyncHandler(async (req, res) => {
    const tier = await SlotTier.findByPk(req.params.id);
    if (!tier) throw new AppError('Slot tier not found', 404);

    tier.isActive = !tier.isActive;
    await tier.save();

    res.status(200).json({
        success: true,
        message: `Slot tier ${tier.isActive ? 'activated' : 'deactivated'}`,
        data: tier
    });
});
