require('dotenv').config();
const mongoose = require('mongoose');
const Membership = require('./models/Membership');
const User = require('./models/User');
const connectDB = require('./config/database');

const membershipTiers = [
    { level: 'Intern', price: 0, canWithdraw: false, canUseTransactionPassword: false, order: 0 },
    { level: 'V1', price: 3300, canWithdraw: true, canUseTransactionPassword: true, order: 1 },
    { level: 'V2', price: 9600, canWithdraw: true, canUseTransactionPassword: true, order: 2 },
    { level: 'V3', price: 27000, canWithdraw: true, canUseTransactionPassword: true, order: 3 },
    { level: 'V4', price: 78000, canWithdraw: true, canUseTransactionPassword: true, order: 4 },
    { level: 'V5', price: 220000, canWithdraw: true, canUseTransactionPassword: true, order: 5 },
    { level: 'V6', price: 590000, canWithdraw: true, canUseTransactionPassword: true, order: 6 },
    { level: 'V7', price: 1280000, canWithdraw: true, canUseTransactionPassword: true, order: 7 },
    { level: 'V8', price: 2530000, canWithdraw: true, canUseTransactionPassword: true, order: 8 },
    { level: 'V9', price: 5000000, canWithdraw: true, canUseTransactionPassword: true, order: 9 },
    { level: 'V10', price: 9800000, canWithdraw: true, canUseTransactionPassword: true, order: 10 }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Seed membership tiers
        console.log('Seeding membership tiers...');
        await Membership.deleteMany({});
        await Membership.insertMany(membershipTiers);
        console.log('✓ Membership tiers seeded successfully');

        // Create default admin user if doesn't exist
        const adminPhone = '+251900000000';
        const adminPassword = 'admin123';

        const adminExists = await User.findOne({ phone: adminPhone });

        if (!adminExists) {
            console.log('Creating default admin user...');
            await User.create({
                phone: adminPhone,
                password: adminPassword,
                role: 'admin',
                membershipLevel: 'V10',
                invitationCode: 'FXRADMIN001'
            });
            console.log(`✓ Admin user created with phone: ${adminPhone}`);
        } else {
            console.log('Admin user already exists');
        }

        console.log('\n✓ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
