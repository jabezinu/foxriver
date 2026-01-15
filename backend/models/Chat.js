const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Chat extends Model { }

Chat.init({
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
    participants: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    lastMessage: {
        type: DataTypes.JSON,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Chat',
    tableName: 'chats'
});

module.exports = Chat;
