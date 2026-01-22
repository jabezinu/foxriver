const { sequelize } = require('../config/database');
const logger = require('../config/logger');

/**
 * Add database indexes if they don't exist
 */
async function addAllIndexes() {
    try {
        logger.info('Checking and adding database indexes...');
        
        // List of indexes to ensure exist
        const indexes = [
            {
                table: 'users',
                name: 'idx_users_phone',
                fields: ['phone'],
                unique: true
            },
            {
                table: 'users',
                name: 'idx_users_invitation_code',
                fields: ['invitationCode'],
                unique: true
            },
            {
                table: 'users',
                name: 'idx_users_referrer_id',
                fields: ['referrerId']
            }
        ];
        
        for (const index of indexes) {
            try {
                // Check if index exists
                const [results] = await sequelize.query(`
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = '${index.table}' 
                    AND INDEX_NAME = '${index.name}'
                `);
                
                if (results[0].count === 0) {
                    // Create index
                    const uniqueClause = index.unique ? 'UNIQUE' : '';
                    const fieldsClause = index.fields.map(field => `\`${field}\``).join(', ');
                    
                    await sequelize.query(`
                        CREATE ${uniqueClause} INDEX \`${index.name}\` 
                        ON \`${index.table}\` (${fieldsClause})
                    `);
                    
                    logger.info(`Created index: ${index.name} on ${index.table}`);
                } else {
                    logger.debug(`Index already exists: ${index.name}`);
                }
            } catch (indexError) {
                // Log warning but don't fail - index might already exist with different name
                logger.warn(`Could not create index ${index.name}:`, indexError.message);
            }
        }
        
        logger.info('Database indexes check completed');
        return true;
        
    } catch (error) {
        logger.error('Failed to add database indexes:', error.message);
        return false;
    }
}

module.exports = { addAllIndexes };