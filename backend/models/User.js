const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
        match: [/^\+251\d{9}$/, 'Please provide a valid Ethiopian phone number']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    membershipLevel: {
        type: String,
        enum: ['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'],
        default: 'Intern'
    },
    incomeWallet: {
        type: Number,
        default: 0
    },
    personalWallet: {
        type: Number,
        default: 0
    },
    transactionPassword: {
        type: String,
        select: false,
        validate: {
            validator: function (v) {
                return !v || /^\d{6}$/.test(v);
            },
            message: 'Transaction password must be exactly 6 digits'
        }
    },
    bankAccount: {
        accountName: String,
        bank: {
            type: String,
            enum: ['CBE', 'Awash', 'BOA', '']
        },
        accountNumber: String,
        phone: String,
        isSet: {
            type: Boolean,
            default: false
        }
    },
    pendingBankAccount: {
        accountName: String,
        bank: {
            type: String,
            enum: ['CBE', 'Awash', 'BOA', '']
        },
        accountNumber: String,
        phone: String
    },
    bankChangeRequestDate: Date,
    bankChangeStatus: {
        type: String,
        enum: ['none', 'pending'],
        default: 'none'
    },
    referrerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    invitationCode: {
        type: String,
        unique: true,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    withdrawalRestrictedUntil: Date,
    lastLogin: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Hash transaction password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('transactionPassword') || !this.transactionPassword) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.transactionPassword = await bcrypt.hash(this.transactionPassword, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Compare transaction password
userSchema.methods.matchTransactionPassword = async function (enteredPassword) {
    if (!this.transactionPassword) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.transactionPassword);
};

// Get referral link
userSchema.methods.getReferralLink = function () {
    return `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${this.invitationCode}`;
};

module.exports = mongoose.model('User', userSchema);
