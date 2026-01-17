const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Withdrawal extends Model { }

Withdrawal.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            isIn: [[100, 200, 3600, 9900, 30000, 45000, 60000, 90000, 120000, 180000]]
        }
    },
    walletType: {
        type: DataTypes.ENUM('income', 'personal'),
        allowNull: false
    },
    grossAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    taxAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    netAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Withdrawal',
    tableName: 'withdrawals',
    indexes: [
        { fields: ['user', 'status'] },
        { fields: ['status', 'createdAt'] }
    ],
    hooks: {
        beforeValidate: (withdrawal) => {
            if (withdrawal.isNewRecord || withdrawal.changed('amount')) {
                withdrawal.grossAmount = withdrawal.amount;
                withdrawal.taxAmount = withdrawal.amount * 0.1;
                withdrawal.netAmount = withdrawal.amount - withdrawal.taxAmount;
            }
        }
    }
});

module.exports = Withdrawal;
