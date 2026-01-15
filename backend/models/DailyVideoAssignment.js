const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class DailyVideoAssignment extends Model {}

DailyVideoAssignment.init({
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
    assignmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    videos: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    sequelize,
    modelName: 'DailyVideoAssignment',
    tableName: 'daily_video_assignments',
    indexes: [
        { unique: true, fields: ['user', 'assignmentDate'] },
        { fields: ['assignmentDate'] }
    ]
});

module.exports = DailyVideoAssignment;
