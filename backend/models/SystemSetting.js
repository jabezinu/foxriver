const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    commissionPercentA: {
        type: Number,
        default: 10
    },
    commissionPercentB: {
        type: Number,
        default: 5
    },
    commissionPercentC: {
        type: Number,
        default: 2
    },
    maxReferralsPerUser: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    salaryDirect15Threshold: {
        type: Number,
        default: 15
    },
    salaryDirect15Amount: {
        type: Number,
        default: 15000
    },
    salaryDirect20Threshold: {
        type: Number,
        default: 20
    },
    salaryDirect20Amount: {
        type: Number,
        default: 20000
    },
    salaryDirect10Threshold: {
        type: Number,
        default: 10
    },
    salaryDirect10Amount: {
        type: Number,
        default: 10000
    },
    salaryNetwork40Threshold: {
        type: Number,
        default: 40
    },
    salaryNetwork40Amount: {
        type: Number,
        default: 48000
    },
    videoPaymentAmount: {
        type: Number,
        default: 10 // Default payment per video in ETB
    },
    videosPerDay: {
        type: Number,
        default: 4 // Number of videos shown per day
    },
    videoWatchTimeRequired: {
        type: Number,
        default: 8 // Required watch time in seconds
    },
    frontendDisabled: {
        type: Boolean,
        default: false // Whether the user frontend is disabled
    },
    tasksDisabled: {
        type: Boolean,
        default: false // Whether tasks are disabled for the day
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
