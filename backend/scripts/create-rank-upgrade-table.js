const { sequelize } = require('../config/database');
const logger = require('../config/logger');

async function createRankUpgradeTable() {
    try {
        // Create the rank_upgrade_requests table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS rank_upgrade_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user INT NOT NULL,
                currentLevel VARCHAR(255) NOT NULL,
                requestedLevel VARCHAR(255) NOT NULL,
                depositId INT NOT NULL,
                status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
                approvedBy INT NULL,
                approvedAt DATETIME NULL,
                rejectionReason TEXT NULL,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (depositId) REFERENCES deposits(id) ON DELETE CASCADE,
                FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL,
                
                INDEX idx_user_status (user, status),
                INDEX idx_deposit (depositId),
                INDEX idx_status_created (status, createdAt)
            )
        `);

        logger.info('Rank upgrade requests table created successfully');
        return true;
    } catch (error) {
        logger.error('Failed to create rank upgrade requests table:', error.message);
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    createRankUpgradeTable()
        .then(success => {
            if (success) {
                logger.info('Database migration completed successfully');
            } else {
                logger.error('Database migration failed');
            }
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            logger.error('Migration error:', error);
            process.exit(1);
        });
}

module.exports = { createRankUpgradeTable };