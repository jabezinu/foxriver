const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Commission extends Model {}

Commission.init({
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
    downlineUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    level: {
        type: DataTypes.ENUM('A', 'B', 'C'),
        allowNull: false
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    amountEarned: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    sourceTask: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'task_completions',
            key: 'id'
        }
    },
    sourceMembership: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Commission',
    tableName: 'commissions',
    indexes: [
        { fields: ['user', 'createdAt'] },
        { fields: ['downlineUser'] }
    ]
});

module.exports = Commission;
