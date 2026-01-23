const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add the rankUpgradeBonusPercent column to system_settings table
        await queryInterface.addColumn('system_settings', 'rankUpgradeBonusPercent', {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 15.00,
            allowNull: true,
            validate: {
                min: 0,
                max: 100
            }
        });
        
        console.log('✓ Added rankUpgradeBonusPercent column to system_settings table');
    },

    down: async (queryInterface, Sequelize) => {
        // Remove the rankUpgradeBonusPercent column
        await queryInterface.removeColumn('system_settings', 'rankUpgradeBonusPercent');
        
        console.log('✓ Removed rankUpgradeBonusPercent column from system_settings table');
    }
};