const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class CourseCategory extends Model {}

CourseCategory.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    sequelize,
    modelName: 'CourseCategory',
    tableName: 'course_categories',
    indexes: [
        { fields: ['status', 'order'] }
    ]
});

module.exports = CourseCategory;
