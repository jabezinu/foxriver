require('dotenv').config();
const mongoose = require('mongoose');
const Membership = require('../models/Membership');

const addHiddenField = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update all memberships that don't have the hidden field
        const result = await Membership.updateMany(
            { hidden: { $exists: false } },
            { $set: { hidden: false } }
        );

        console.log(`✅ Updated ${result.modifiedCount} memberships with hidden: false`);

        // Display all memberships
        const memberships = await Membership.find().sort({ order: 1 });
        console.log('\nCurrent Memberships:');
        memberships.forEach(m => {
            console.log(`  ${m.level}: hidden = ${m.hidden}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addHiddenField();
