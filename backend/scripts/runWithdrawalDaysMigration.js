const { sequelize } = require('../config/database');
const migration = require('../migrations/20250125000001-add-withdrawal-day-restrictions');

async function runMigration() {
    try {
        console.log('Running migration to add withdrawalRestrictedDays column...');
        
        await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
        
        console.log('✅ Migration completed successfully!');
        console.log('withdrawalRestrictedDays column has been added to users table');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();