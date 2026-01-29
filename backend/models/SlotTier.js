const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SlotTier extends Model { }

SlotTier.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    betAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 1
        }
    },
    winAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 1
        }
    },
    winProbability: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10,
        validate: {
            min: 0,
            max: 100
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'SlotTier',
    tableName: 'slot_tiers',
    indexes: [
        { fields: ['isActive', 'order'] }
    ]
});

module.exports = SlotTier;
