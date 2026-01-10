const SystemSetting = require('../models/SystemSetting');

// Get system settings
exports.getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await SystemSetting.create({});
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching system settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system settings'
        });
    }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
    try {
        const updates = req.body;
        
        let settings = await SystemSetting.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await SystemSetting.create(updates);
        } else {
            // Update existing settings
            settings = await SystemSetting.findOneAndUpdate(
                {},
                updates,
                { new: true, runValidators: true }
            );
        }

        res.json({
            success: true,
            data: settings,
            message: 'System settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update system settings'
        });
    }
};

// Toggle frontend disabled status
exports.toggleFrontend = async (req, res) => {
    try {
        const { frontendDisabled } = req.body;
        
        let settings = await SystemSetting.findOne();
        
        if (!settings) {
            settings = await SystemSetting.create({ frontendDisabled });
        } else {
            settings.frontendDisabled = frontendDisabled;
            await settings.save();
        }

        res.json({
            success: true,
            data: settings,
            message: `Frontend ${frontendDisabled ? 'disabled' : 'enabled'} successfully`
        });
    } catch (error) {
        console.error('Error toggling frontend:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle frontend status'
        });
    }
};
