const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    level: {
        type: String,
        required: true,
        unique: true,
        enum: ['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10']
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

// Calculate daily income: price / 30 (except Intern)
membershipSchema.methods.getDailyIncome = function () {
    if (this.level === 'Intern') return 50;
    return this.price / 30;
};

// Calculate per video income: daily income / 5
membershipSchema.methods.getPerVideoIncome = function () {
    if (this.level === 'Intern') return 10;
    return this.getDailyIncome() / 5;
};

// Calculate 4-day income
membershipSchema.methods.getFourDayIncome = function () {
    return this.getDailyIncome() * 4;
};

module.exports = mongoose.model('Membership', membershipSchema);
