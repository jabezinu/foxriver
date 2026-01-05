const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please specify deposit amount'],
        enum: [3300, 9600, 27000, 50000, 78000, 100000, 150000, 200000]
    },
    paymentMethod: {
        type: mongoose.Schema.ObjectId,
        ref: 'BankAccount',
        required: [true, 'Please select a payment method']
    },
    transactionFT: {
        type: String,
        default: null
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'ft_submitted', 'approved', 'rejected'],
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

// Index for querying deposits by user and status
depositSchema.index({ user: 1, status: 1 });
depositSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Deposit', depositSchema);
