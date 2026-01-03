const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    level: {
        type: String,
        required: true,
        unique: true,
        enum: ['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10']
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    canWithdraw: {
        type: Boolean,
        required: true,
        default: false
    },
    canUseTransactionPassword: {
        type: Boolean,
        required: true,
        default: false
    },
    order: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Calculate daily income: price / 30
membershipSchema.methods.getDailyIncome = function () {
    return this.price / 30;
};

// Calculate per video income: daily income / 5
membershipSchema.methods.getPerVideoIncome = function () {
    return this.getDailyIncome() / 5;
};

// Calculate 4-day income
membershipSchema.methods.getFourDayIncome = function () {
    return this.getDailyIncome() * 4;
};

module.exports = mongoose.model('Membership', membershipSchema);
