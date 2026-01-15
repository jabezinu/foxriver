const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class QnA extends Model {}

QnA.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'QnA',
    tableName: 'qnas',
    indexes: [
        { fields: ['status', 'createdAt'] }
    ]
});

module.exports = QnA;
