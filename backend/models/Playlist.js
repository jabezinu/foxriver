const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Playlist extends Model {}

Playlist.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        defaultValue: 'Unnamed Playlist'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    addedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Playlist',
    tableName: 'playlists',
    indexes: [
        { fields: ['status'] }
    ]
});

module.exports = Playlist;
