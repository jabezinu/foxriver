const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        unique: true,
        trim: true
    },
    accountHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true
    },
    serviceType: {
        type: String,
        enum: ['bank', 'wallet'],
        default: 'bank'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for querying active accounts
bankAccountSchema.index({ isActive: 1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
