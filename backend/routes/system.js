const express = require('express');
const router = express.Router();
const SystemSetting = require('../models/SystemSetting');

// @desc    Get public system settings
// @route   GET /api/system/settings
// @access  Public
router.get('/settings', async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();

        if (!settings) {
            settings = await SystemSetting.create({});
        }

        // Only return the frontendDisabled field for public access
        res.status(200).json({
            success: true,
            frontendDisabled: settings.frontendDisabled || false
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;
