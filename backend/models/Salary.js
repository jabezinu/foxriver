const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Salary extends Model {}

Salary.init({
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
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    breakdown: {
        type: DataTypes.JSON,
        allowNull: true
    },
    ruleApplied: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Salary',
    tableName: 'salaries',
    indexes: [
        { unique: true, fields: ['user', 'month', 'year'] }
    ]
});

module.exports = Salary;
