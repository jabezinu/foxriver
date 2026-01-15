const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Course extends Model {}

Course.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'course_categories',
            key: 'id'
        }
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
    modelName: 'Course',
    tableName: 'courses',
    indexes: [
        { fields: ['category', 'status', 'order'] }
    ]
});

module.exports = Course;
