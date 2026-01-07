const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateMembershipActivation = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update all users who don't have membershipActivatedAt set
        const result = await User.updateMany(
            { membershipActivatedAt: { $exists: false } },
            { $set: { membershipActivatedAt: new Date() } }
        );

        console.log(`Updated ${result.modifiedCount} users with membershipActivatedAt field`);

        // For existing Intern users, set their activation date to their creation date
        // This ensures they get the full 4-day trial from when they registered
        const internResult = await User.updateMany(
            { 
                membershipLevel: 'Intern',
                membershipActivatedAt: { $exists: true }
            },
            [
                {
                    $set: {
                        membershipActivatedAt: '$createdAt'
                    }
                }
            ]
        );

        console.log(`Updated ${internResult.modifiedCount} Intern users to use their registration date as activation date`);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateMembershipActivation();