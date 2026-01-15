const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Deposit extends Model {}

Deposit.init({
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
            isIn: [[3300, 9600, 27000, 50000, 78000, 100000, 150000, 200000]]
        }
    },
    paymentMethod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'bank_accounts',
            key: 'id'
        }
    },
    transactionFT: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transactionScreenshot: {
        type: DataTypes.STRING,
        allowNull: true
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'ft_submitted', 'approved', 'rejected'),
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
    modelName: 'Deposit',
    tableName: 'deposits',
    indexes: [
        { fields: ['user', 'status'] },
        { fields: ['status', 'createdAt'] }
    ]
});

module.exports = Deposit;
