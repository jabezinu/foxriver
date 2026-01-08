const mongoose = require('mongoose');

const slotTierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a tier name'],
        trim: true
    },
    betAmount: {
        type: Number,
        required: [true, 'Please provide bet amount'],
        min: [1, 'Bet amount must be at least 1 ETB']
    },
    winAmount: {
        type: Number,
        required: [true, 'Please provide win amount'],
        min: [1, 'Win amount must be at least 1 ETB']
    },
    winProbability: {
        type: Number,
        required: [true, 'Please provide win probability'],
        min: [0, 'Probability must be between 0 and 100'],
        max: [100, 'Probability must be between 0 and 100'],
        default: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
slotTierSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('SlotTier', slotTierSchema);
