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

        // Return public settings for user information
        res.status(200).json({
            success: true,
            frontendDisabled: settings.frontendDisabled || false,
            settings: {
                commissionPercentA: settings.commissionPercentA,
                commissionPercentB: settings.commissionPercentB,
                commissionPercentC: settings.commissionPercentC,
                salaryDirect10Threshold: settings.salaryDirect10Threshold,
                salaryDirect10Amount: settings.salaryDirect10Amount,
                salaryDirect15Threshold: settings.salaryDirect15Threshold,
                salaryDirect15Amount: settings.salaryDirect15Amount,
                salaryDirect20Threshold: settings.salaryDirect20Threshold,
                salaryDirect20Amount: settings.salaryDirect20Amount,
                salaryNetwork40Threshold: settings.salaryNetwork40Threshold,
                salaryNetwork40Amount: settings.salaryNetwork40Amount,
                videoPaymentAmount: settings.videoPaymentAmount,
                videosPerDay: settings.videosPerDay,
                videoWatchTimeRequired: settings.videoWatchTimeRequired,
                frontendDisabled: settings.frontendDisabled || false,
                tasksDisabled: settings.tasksDisabled || false
            }
        });
    } catch (error) {
        console.error('System settings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;
