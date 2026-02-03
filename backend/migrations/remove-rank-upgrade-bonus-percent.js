const { DataTypes } = require('sequelize');

// Migration to remove rankUpgradeBonusPercent column from system_settings table
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove the rankUpgradeBonusPercent column from system_settings table
        await queryInterface.removeColumn('system_settings', 'rankUpgradeBonusPercent');
        
        console.log('✓ Removed rankUpgradeBonusPercent column from system_settings table');
    },

    down: async (queryInterface, Sequelize) => {
        // Add the rankUpgradeBonusPercent column back (for rollback)
        await queryInterface.addColumn('system_settings', 'rankUpgradeBonusPercent', {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 15.00,
            allowNull: true,
            comment: 'Percentage bonus for rank upgrades (Rank 2 and above)'
        });
        
        console.log('✓ Re-added rankUpgradeBonusPercent column to system_settings table');
    }
};
