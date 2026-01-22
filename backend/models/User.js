const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

class User extends Model {
    // Compare password
    async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    // Compare transaction password
    async matchTransactionPassword(enteredPassword) {
        if (!this.transactionPassword) {
            return false;
        }
        return await bcrypt.compare(enteredPassword, this.transactionPassword);
    }

    // Get referral link
    getReferralLink() {
        return `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${this.invitationCode}`;
    }

    // Check if Intern user can earn (within 4 days of membership activation)
    canInternEarn() {
        if (this.membershipLevel !== 'Intern') {
            return true; // Non-interns can always earn
        }

        const now = new Date();
        const activationDate = this.membershipActivatedAt || this.createdAt;
        const daysSinceActivation = Math.floor((now - activationDate) / (1000 * 60 * 60 * 24));

        return daysSinceActivation < 4;
    }

    // Get days remaining for Intern earning
    getInternDaysRemaining() {
        if (this.membershipLevel !== 'Intern') {
            return null;
        }

        const now = new Date();
        const activationDate = this.membershipActivatedAt || this.createdAt;
        const daysSinceActivation = Math.floor((now - activationDate) / (1000 * 60 * 60 * 24));

        return Math.max(0, 4 - daysSinceActivation);
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            is: /^\+251\d{9}$/
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'superadmin'),
        defaultValue: 'user'
    },
    permissions: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    membershipLevel: {
        type: DataTypes.ENUM('Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'),
        defaultValue: 'Intern'
    },
    incomeWallet: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    personalWallet: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    transactionPassword: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bankAccount: {
        type: DataTypes.JSON,
        defaultValue: {
            accountName: null,
            bank: null,
            accountNumber: null,
            phone: null,
            isSet: false
        }
    },
    pendingBankAccount: {
        type: DataTypes.JSON,
        defaultValue: null
    },
    bankChangeRequestDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    bankChangeStatus: {
        type: DataTypes.ENUM('none', 'pending', 'declined'),
        defaultValue: 'none'
    },
    bankChangeConfirmations: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    referrerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    invitationCode: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    withdrawalRestrictedUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastSalaryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    membershipActivatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
        { fields: ['phone'] },
        { fields: ['invitationCode'] },
        { fields: ['referrerId'] },
        { fields: ['membershipLevel'] },
        { fields: ['role'] }
    ],
    hooks: {
        beforeSave: async (user) => {
            // Hash password if modified
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
            
            // Hash transaction password if modified
            if (user.changed('transactionPassword') && user.transactionPassword) {
                // Validate 6 digits before hashing
                if (!user.transactionPassword.startsWith('$2') && !/^\d{6}$/.test(user.transactionPassword)) {
                    throw new Error('Transaction password must be exactly 6 digits');
                }
                const salt = await bcrypt.genSalt(10);
                user.transactionPassword = await bcrypt.hash(user.transactionPassword, salt);
            }
        }
    }
});

module.exports = User;
