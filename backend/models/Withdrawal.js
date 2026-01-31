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
            isIn: [[750, 1600, 4500, 10000, 18700, 31500, 53200]]
        }
    },
    walletType: {
        type: DataTypes.ENUM('income', 'personal', 'tasks'),
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
        type: DataTypes.STRING(255),
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
