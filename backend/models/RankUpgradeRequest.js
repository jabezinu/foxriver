const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class RankUpgradeRequest extends Model { }

RankUpgradeRequest.init({
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
    currentLevel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    requestedLevel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    depositId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Made optional for wallet payments
        references: {
            model: 'deposits',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending'
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
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'RankUpgradeRequest',
    tableName: 'rank_upgrade_requests',
    indexes: [
        { fields: ['user', 'status'] },
        { fields: ['depositId'] },
        { fields: ['status', 'createdAt'] }
    ]
});

module.exports = RankUpgradeRequest;