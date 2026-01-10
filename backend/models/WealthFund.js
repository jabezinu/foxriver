const mongoose = require('mongoose');

const wealthFundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a fund name'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please provide a fund image']
    },
    days: {
        type: Number,
        required: [true, 'Please provide investment duration in days'],
        min: [1, 'Duration must be at least 1 day']
    },
    profitType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    dailyProfit: {
        type: Number,
        required: [true, 'Please provide daily profit'],
        min: [0, 'Daily profit cannot be negative']
    },
    minimumDeposit: {
        type: Number,
        required: [true, 'Please provide minimum deposit amount'],
        min: [0, 'Minimum deposit cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WealthFund', wealthFundSchema);
