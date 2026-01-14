require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/database');

const promoteAdmin = async () => {
    try {
        await connectDB();
        const adminPhone = '+251900000001'; // Corrected admin phone
        const user = await User.findOne({ phone: adminPhone });

        if (user) {
            user.role = 'superadmin';
            await user.save();
            console.log(`✓ User ${adminPhone} promoted to superadmin`);
        } else {
            console.log(`✗ User ${adminPhone} not found`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error promoting admin:', error);
        process.exit(1);
    }
};

promoteAdmin();
