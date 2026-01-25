const { sequelize } = require('../config/database');
const migration = require('../migrations/add-tasks-wallet');

async function runMigration() {
    try {
        console.log('Running migration to add tasksWallet column...');
        
        await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
        
        console.log('✅ Migration completed successfully!');
        console.log('tasksWallet column has been added to users table');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();