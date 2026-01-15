const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class BankAccount extends Model {}

BankAccount.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    accountHolderName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceType: {
        type: DataTypes.ENUM('bank', 'wallet'),
        defaultValue: 'bank'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'BankAccount',
    tableName: 'bank_accounts',
    indexes: [
        { fields: ['isActive'] }
    ]
});

module.exports = BankAccount;
