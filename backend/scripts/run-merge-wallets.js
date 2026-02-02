const { sequelize } = require('../config/database');
const migration = require('../migrations/20260202000001-merge-wallets');

async function runMigration() {
    try {
        console.log('Running migration to merge tasksWallet into incomeWallet...');
        
        await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
        
        console.log('✅ Migration completed successfully!');
        console.log('Balances transferred and tasksWallet column dropped.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
