const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SpinResult extends Model {}

SpinResult.init({
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
    result: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    amountWon: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    balanceBefore: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    balanceAfter: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    walletType: {
        type: DataTypes.ENUM('personal', 'income'),
        defaultValue: 'personal'
    },
    tier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'slot_tiers',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'SpinResult',
    tableName: 'spin_results',
    indexes: [
        { fields: ['user', 'createdAt'] },
        { fields: ['tier'] }
    ]
});

module.exports = SpinResult;
