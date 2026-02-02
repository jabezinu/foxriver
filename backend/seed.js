require('dotenv').config();
const connectDB = require('./config/database');
const { sequelize } = require('./config/database');
// Import all models to ensure they're registered with Sequelize
const models = require('./models');
const { Membership, User } = models;

const membershipTiers = [
    { level: 'Intern', price: 0, canWithdraw: false, order: 0 },
    { level: 'Rank 1', price: 3300, canWithdraw: true, order: 1 },
    { level: 'Rank 2', price: 9600, canWithdraw: true, order: 2 },
    { level: 'Rank 3', price: 27000, canWithdraw: true, order: 3 },
    { level: 'Rank 4', price: 78000, canWithdraw: true, order: 4 },
    { level: 'Rank 5', price: 220000, canWithdraw: true, order: 5 },
    { level: 'Rank 6', price: 590000, canWithdraw: true, order: 6 },
    { level: 'Rank 7', price: 1280000, canWithdraw: true, order: 7 },
    { level: 'Rank 8', price: 2530000, canWithdraw: true, order: 8 },
    { level: 'Rank 9', price: 5000000, canWithdraw: true, order: 9 },
    { level: 'Rank 10', price: 9800000, canWithdraw: true, order: 10 }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Sync database (create tables)
        await sequelize.sync({ force: true });
        console.log('✓ Database tables created');

        // Seed membership tiers
        console.log('Seeding membership tiers...');
        await Membership.bulkCreate(membershipTiers);
        console.log('✓ Membership tiers seeded successfully');

        // Create default admin user if doesn't exist
        const adminPhone = '+251900000000';
        const adminPassword = 'admin123';

        const adminExists = await User.findOne({ where: { phone: adminPhone } });

        if (!adminExists) {
            console.log('Creating default admin user...');
            await User.create({
                phone: adminPhone,
                password: adminPassword,
                role: 'superadmin',
                membershipLevel: 'Rank 10',
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
