const { sequelize } = require('../config/database');
const logger = require('../config/logger');

/**
 * Run startup database checks
 */
async function runStartupDatabaseCheck() {
    try {
        logger.info('Running startup database check...');
        
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection verified');
        
        // Check if essential tables exist
        const [results] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME IN ('users', 'deposits', 'withdrawals')
        `);
        
        const tableNames = results.map(row => row.TABLE_NAME);
        const requiredTables = ['users', 'deposits', 'withdrawals'];
        const missingTables = requiredTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
            logger.warn('Missing required tables:', missingTables);
            return false;
        }
        
        logger.info('Database check completed successfully');
        return true;
        
    } catch (error) {
        logger.error('Database check failed:', error.message);
        return false;
    }
}

module.exports = { runStartupDatabaseCheck };