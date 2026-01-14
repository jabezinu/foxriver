const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    profilePhoto: {
        type: String,
        default: null
    },
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
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    permissions: [{
        type: String,
        enum: [
            'manage_users',
            'manage_deposits',
            'manage_withdrawals',
            'manage_tasks',
            'manage_courses',
            'manage_wealth',
            'manage_qna',
            'manage_messages',
            'manage_news',
            'manage_slot_machine',
            'manage_bank_settings',
            'manage_referrals',
            'manage_membership',
            'manage_system_settings'
        ]
    }],
    membershipLevel: {
        type: String,
        enum: ['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'],
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
                // Skip validation if password is already hashed (starts with $2)
                if (!v || v.startsWith('$2')) return true;
                // Only validate unhashed passwords (must be 6 digits)
                return /^\d{6}$/.test(v);
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
    lastSalaryDate: Date,
    lastLogin: Date,
    membershipActivatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
userSchema.index({ phone: 1 });
userSchema.index({ invitationCode: 1 });
userSchema.index({ referrerId: 1 });
userSchema.index({ membershipLevel: 1 });
userSchema.index({ role: 1 });

// Hash password and transaction password before saving
userSchema.pre('save', async function () {
    // Hash password if modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    
    // Hash transaction password if modified
    if (this.isModified('transactionPassword') && this.transactionPassword) {
        const salt = await bcrypt.genSalt(10);
        this.transactionPassword = await bcrypt.hash(this.transactionPassword, salt);
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

// Check if Intern user can earn (within 4 days of membership activation)
userSchema.methods.canInternEarn = function () {
    if (this.membershipLevel !== 'Intern') {
        return true; // Non-interns can always earn
    }

    const now = new Date();
    const activationDate = this.membershipActivatedAt || this.createdAt;
    const daysSinceActivation = Math.floor((now - activationDate) / (1000 * 60 * 60 * 24));

    return daysSinceActivation < 4;
};

// Get days remaining for Intern earning
userSchema.methods.getInternDaysRemaining = function () {
    if (this.membershipLevel !== 'Intern') {
        return null;
    }

    const now = new Date();
    const activationDate = this.membershipActivatedAt || this.createdAt;
    const daysSinceActivation = Math.floor((now - activationDate) / (1000 * 60 * 60 * 24));

    return Math.max(0, 4 - daysSinceActivation);
};

module.exports = mongoose.model('User', userSchema);
