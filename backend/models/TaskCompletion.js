const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class TaskCompletion extends Model {}

TaskCompletion.init({
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
    task: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id'
        }
    },
    earningsAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    watchedSeconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    requiredWatchTime: {
        type: DataTypes.INTEGER,
        defaultValue: 15
    }
}, {
    sequelize,
    modelName: 'TaskCompletion',
    tableName: 'task_completions',
    indexes: [
        { unique: true, fields: ['user', 'task'] },
        { fields: ['user', 'createdAt'] }
    ]
});

module.exports = TaskCompletion;
