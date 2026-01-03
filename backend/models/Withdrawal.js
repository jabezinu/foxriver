const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please specify withdrawal amount'],
        enum: [100, 200, 3300, 9600, 10000, 27000, 50000, 78000, 100000, 300000, 500000, 3000000, 5000000]
    },
    walletType: {
        type: String,
        required: [true, 'Please select wallet type'],
        enum: ['income', 'personal']
    },
    grossAmount: {
        type: Number,
        required: true
    },
    taxAmount: {
        type: Number,
        required: true
    },
    netAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: String,
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    approvedAt: Date
}, {
    timestamps: true
});

// Calculate tax (10%) before saving
withdrawalSchema.pre('save', function (next) {
    if (this.isNew) {
        this.grossAmount = this.amount;
        this.taxAmount = this.amount * 0.1;
        this.netAmount = this.amount - this.taxAmount;
    }
    next();
});

// Index for querying withdrawals
withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
