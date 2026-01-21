const User = require('../models/User');
const logger = require('../config/logger');

const createAdminUser = async () => {
    try {
        const adminPhone = process.env.ADMIN_PHONE || '+251900000000';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { phone: adminPhone } });

        if (existingAdmin) {
            logger.info('Admin user already exists');
            return;
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            phone: adminPhone,
            password: adminPassword,
            role: 'superadmin',
            membershipLevel: 'Rank 10',
            isActive: true,
            invitationCode: 'ADMIN001'
        });

        logger.info(`Admin user created successfully: ${adminPhone}`);
        return admin;
    } catch (error) {
        logger.error('Error creating admin user:', error.message);
        throw error;
    }
};

module.exports = createAdminUser;
