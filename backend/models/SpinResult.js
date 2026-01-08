const mongoose = require('mongoose');

const spinResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    result: {
        type: String,
        enum: ['Try Again', 'Win 100 ETB'],
        required: true
    },
    amountPaid: {
        type: Number,
        default: 10
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
    }
}, {
    timestamps: true
});

// Index for faster queries
spinResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SpinResult', spinResultSchema);
