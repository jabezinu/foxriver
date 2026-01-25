const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Create default admin user if it doesn't exist
 */
async function createAdminUser() {
    try {
        const adminPhone = process.env.ADMIN_PHONE || '+251900000000';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin user already exists
        const existingAdmin = await User.findOne({
            where: { phone: adminPhone }
        });

        if (existingAdmin) {
            logger.info('Admin user already exists');
            return;
        }

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin',
            phone: adminPhone,
            password: adminPassword,
            role: 'admin',
            membershipLevel: 'Rank 10',
            incomeWallet: 0,
            personalWallet: 0,
            tasksWallet: 0,
            invitationCode: 'ADMIN001'
        });

        logger.info('Admin user created successfully', { 
            id: adminUser.id, 
            phone: adminUser.phone 
        });

    } catch (error) {
        logger.error('Failed to create admin user:', error.message);
        throw error;
    }
}

module.exports = createAdminUser;