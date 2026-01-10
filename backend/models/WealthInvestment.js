const mongoose = require('mongoose');

const wealthInvestmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    wealthFund: {
        type: mongoose.Schema.ObjectId,
        ref: 'WealthFund',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please provide investment amount'],
        min: [0, 'Amount cannot be negative']
    },
    fundingSource: {
        incomeWallet: {
            type: Number,
            default: 0
        },
        personalWallet: {
            type: Number,
            default: 0
        }
    },
    dailyProfit: {
        type: Number,
        required: true
    },
    profitType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    totalRevenue: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    completedAt: Date
}, {
    timestamps: true
});

// Calculate end date before saving
wealthInvestmentSchema.pre('save', function(next) {
    if (this.isNew) {
        const endDate = new Date(this.startDate);
        endDate.setDate(endDate.getDate() + this.days);
        this.endDate = endDate;
    }
    next();
});

module.exports = mongoose.model('WealthInvestment', wealthInvestmentSchema);
