const mongoose = require('mongoose');

const spinResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    result: {
        type: String,
        required: [true, 'Please provide spin result']
    },
    amountPaid: {
        type: Number,
        required: true
    },
    amountWon: {
        type: Number,
        default: 0
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    walletType: {
        type: String,
        enum: ['personal', 'income'],
        default: 'personal'
    },
    tier: {
        type: mongoose.Schema.ObjectId,
        ref: 'SlotTier',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
spinResultSchema.index({ user: 1, createdAt: -1 });
spinResultSchema.index({ tier: 1 });

module.exports = mongoose.model('SpinResult', spinResultSchema);
