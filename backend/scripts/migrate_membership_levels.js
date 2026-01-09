require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Migration script to update membership levels from V1-V10 to Rank 1-Rank 10
async function migrateMembershipLevels() {
    try {
        // Connect directly
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.error('ERROR: MONGODB_URI is not defined in .env file');
            process.exit(1);
        }
        
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Mapping of old values to new values
        const levelMapping = {
            'V1': 'Rank 1',
            'V2': 'Rank 2',
            'V3': 'Rank 3',
            'V4': 'Rank 4',
            'V5': 'Rank 5',
            'V6': 'Rank 6',
            'V7': 'Rank 7',
            'V8': 'Rank 8',
            'V9': 'Rank 9',
            'V10': 'Rank 10'
        };

        console.log('=== Starting Migration ===\n');

        // 1. Migrate Users collection
        console.log('Migrating Users collection...');
        const usersCollection = db.collection('users');
        
        for (const [oldLevel, newLevel] of Object.entries(levelMapping)) {
            const result = await usersCollection.updateMany(
                { membershipLevel: oldLevel },
                { $set: { membershipLevel: newLevel } }
            );
            if (result.modifiedCount > 0) {
                console.log(`  ✓ Updated ${result.modifiedCount} users from "${oldLevel}" to "${newLevel}"`);
            }
        }

        // Count users by level after migration
        const userCounts = await usersCollection.aggregate([
            { $group: { _id: '$membershipLevel', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();
        
        console.log('\nUsers by membership level after migration:');
        userCounts.forEach(item => {
            console.log(`  ${item._id}: ${item.count} users`);
        });

        // 2. Migrate Memberships collection
        console.log('\nMigrating Memberships collection...');
        const membershipsCollection = db.collection('memberships');
        
        for (const [oldLevel, newLevel] of Object.entries(levelMapping)) {
            const result = await membershipsCollection.updateMany(
                { level: oldLevel },
                { $set: { level: newLevel } }
            );
            if (result.modifiedCount > 0) {
                console.log(`  ✓ Updated ${result.modifiedCount} membership tier from "${oldLevel}" to "${newLevel}"`);
            }
        }

        // List all membership tiers after migration
        const memberships = await membershipsCollection.find({}).sort({ order: 1 }).toArray();
        console.log('\nMembership tiers after migration:');
        memberships.forEach(m => {
            console.log(`  ${m.level} (Order: ${m.order}, Price: ${m.price})`);
        });

        // 3. Migrate Commissions collection (if it references membership levels)
        console.log('\nMigrating Commissions collection...');
        const commissionsCollection = db.collection('commissions');
        
        for (const [oldLevel, newLevel] of Object.entries(levelMapping)) {
            const result = await commissionsCollection.updateMany(
                { sourceMembership: oldLevel },
                { $set: { sourceMembership: newLevel } }
            );
            if (result.modifiedCount > 0) {
                console.log(`  ✓ Updated ${result.modifiedCount} commission records from "${oldLevel}" to "${newLevel}"`);
            }
        }

        console.log('\n=== Migration Completed Successfully! ===\n');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateMembershipLevels();
