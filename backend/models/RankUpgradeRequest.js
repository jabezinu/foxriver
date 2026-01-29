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
        type: DataTypes.ENUM('Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'),
        allowNull: false
    },
    requestedLevel: {
        type: DataTypes.ENUM('Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'),
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
        type: DataTypes.STRING(255),
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