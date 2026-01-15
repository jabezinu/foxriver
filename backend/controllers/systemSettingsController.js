const { SystemSetting } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get system settings
// @route   GET /api/system/admin/settings
// @access  Private/Admin
exports.getSystemSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSetting.findOne();
    if (!settings) settings = await SystemSetting.create({});

    res.status(200).json({ success: true, data: settings });
});

// @desc    Update system settings
// @route   PUT /api/system/admin/settings
// @access  Private/Admin
exports.updateSystemSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSetting.findOne();

    if (!settings) {
        settings = await SystemSetting.create(req.body);
    } else {
        await settings.update(req.body);
        await settings.reload();
    }

    res.status(200).json({
        success: true,
        data: settings,
        message: 'System settings updated successfully'
    });
});
