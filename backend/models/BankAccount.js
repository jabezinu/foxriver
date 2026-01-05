const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
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
        enum: ['Bank', 'Wallet'],
        default: 'Bank'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);
