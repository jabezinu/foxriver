require('dotenv').config();
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function addMoreColumns() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('system_settings');
        
        const columnsToAdd = {
            spinWallet: {
                type: DataTypes.ENUM('income', 'personal'),
                defaultValue: 'income'
            },
            depositWallet: {
                type: DataTypes.ENUM('income', 'personal'),
                defaultValue: 'personal'
            }
        };

        for (const [columnName, attributes] of Object.entries(columnsToAdd)) {
            if (!tableInfo[columnName]) {
                console.log(`Adding column: ${columnName}`);
                await queryInterface.addColumn('system_settings', columnName, attributes);
            } else {
                console.log(`Column ${columnName} already exists.`);
            }
        }
        
        console.log('Successfully updated system_settings table with spin and deposit wallets.');
        process.exit(0);
    } catch (error) {
        console.error('Error adding columns:', error);
        process.exit(1);
    }
}

addMoreColumns();
