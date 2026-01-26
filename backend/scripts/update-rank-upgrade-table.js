const { sequelize } = require('../config/database');
const logger = require('../config/logger');

async function updateRankUpgradeTable() {
    try {
        // Make depositId nullable in rank_upgrade_requests table
        await sequelize.query(`
            ALTER TABLE rank_upgrade_requests 
            MODIFY COLUMN depositId INT NULL
        `);

        logger.info('Rank upgrade requests table updated successfully - depositId is now nullable');
        return true;
    } catch (error) {
        logger.error('Failed to update rank upgrade requests table:', error.message);
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    updateRankUpgradeTable()
        .then(success => {
            if (success) {
                logger.info('Database migration completed successfully');
                process.exit(0);
            } else {
                logger.error('Database migration failed');
                process.exit(1);
            }
        })
        .catch(error => {
            logger.error('Migration error:', error);
            process.exit(1);
        });
}

module.exports = { updateRankUpgradeTable };