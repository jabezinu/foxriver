const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class ChatMessage extends Model {}

ChatMessage.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'chats',
            key: 'id'
        }
    },
    sender: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    indexes: [
        { fields: ['chat', 'createdAt'] }
    ]
});

module.exports = ChatMessage;
