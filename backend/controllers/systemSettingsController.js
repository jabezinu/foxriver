const SystemSetting = require('../models/SystemSetting');

// @desc    Get system settings
// @route   GET /api/system/admin/settings
// @access  Private/Admin
exports.getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        
        if (!settings) {
            settings = await SystemSetting.create({});
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch system settings'
        });
    }
};

// @desc    Update system settings
// @route   PUT /api/system/admin/settings
// @access  Private/Admin
exports.updateSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        
        if (!settings) {
            settings = await SystemSetting.create(req.body);
        } else {
            settings = await SystemSetting.findOneAndUpdate(
                {},
                req.body,
                { new: true, runValidators: true }
            );
        }

        res.status(200).json({
            success: true,
            data: settings,
            message: 'System settings updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update system settings'
        });
    }
};
