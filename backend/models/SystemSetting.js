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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
