const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class VideoPool extends Model {}

VideoPool.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    videoId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    playlist: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'playlists',
            key: 'id'
        }
    },
    lastUsed: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'VideoPool',
    tableName: 'video_pools',
    indexes: [
        { fields: ['lastUsed'] },
        { fields: ['playlist'] }
    ]
});

module.exports = VideoPool;
