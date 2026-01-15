const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class News extends Model {}

News.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    showAsPopup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    publishedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'News',
    tableName: 'news',
    indexes: [
        { fields: ['status', 'publishedDate'] },
        { fields: ['status', 'showAsPopup', 'publishedDate'] }
    ]
});

module.exports = News;
