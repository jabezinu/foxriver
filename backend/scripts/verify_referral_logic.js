require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Commission = require('../models/Commission');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean up test users
        const testPhones = ['+251911111111', '+251922222222', '+251933333333', '+251944444444'];
        await User.deleteMany({ phone: { $in: testPhones } });
        await Commission.deleteMany({}); // Optional: clean all for clean test or filter by user

        console.log('Cleaned up test data');

        // 1. Create User W (Top level)
        const userW = await User.create({
            phone: '+251911111111',
            password: 'password123',
            membershipLevel: 'Rank 2',
            invitationCode: 'W1234567'
        });

        // 2. Create User X (Invited by W)
        const userX = await User.create({
            phone: '+251922222222',
            password: 'password123',
            membershipLevel: 'Rank 2',
            referrerId: userW._id,
            invitationCode: 'X1234567'
        });

        // 3. Create User Y (Invited by X)
        const userY = await User.create({
            phone: '+251933333333',
            password: 'password123',
            membershipLevel: 'Rank 2',
            referrerId: userX._id,
            invitationCode: 'Y1234567'
        });

        // 4. Create User Z (Invited by Y, initially Intern)
        const userZ = await User.create({
            phone: '+251944444444',
            password: 'password123',
            membershipLevel: 'Intern',
            referrerId: userY._id,
            invitationCode: 'Z1234567'
        });

        console.log('Created user chain: W -> X -> Y -> Z');

        // Get Rank 2 membership details
        const v2Membership = await Membership.findOne({ level: 'Rank 2' });
        console.log(`Rank 2 Membership Price: ${v2Membership.price}`);

        // Trigger Z upgrade to Rank 2
        console.log('Upgrading Z to Rank 2...');
        const commissions = await calculateAndCreateMembershipCommissions(userZ, v2Membership);

        console.log('Commissions created:', commissions.length);
        commissions.forEach(c => {
            console.log(`Level ${c.level}: ${c.amountEarned} ETB`);
        });

        // Refresh users from DB
        const updatedW = await User.findById(userW._id);
        const updatedX = await User.findById(userX._id);
        const updatedY = await User.findById(userY._id);

        console.log('--- Verifying Balances ---');
        console.log(`User Y (Direct - A): ${updatedY.incomeWallet} / Expected: ${v2Membership.price * 0.1}`);
        console.log(`User X (Indirect 1 - B): ${updatedX.incomeWallet} / Expected: ${v2Membership.price * 0.05}`);
        console.log(`User W (Indirect 2 - C): ${updatedW.incomeWallet} / Expected: ${v2Membership.price * 0.02}`);

        const success =
            updatedY.incomeWallet === v2Membership.price * 0.1 &&
            updatedX.incomeWallet === v2Membership.price * 0.05 &&
            updatedW.incomeWallet === v2Membership.price * 0.02;

        if (success) {
            console.log('✅ Standard commission test passed!');
        } else {
            console.error('❌ Standard commission test failed!');
        }

        // Test Rule: Higher level purchase should not pay commission (if referrer is lower)
        console.log('\n--- Testing Level Eligibility Rule ---');
        // Set Y to Rank 1, but Z is upgrading to Rank 2
        await User.findByIdAndUpdate(userY._id, { membershipLevel: 'Rank 1', incomeWallet: 0 });
        await User.findByIdAndUpdate(userX._id, { incomeWallet: 0 });
        await User.findByIdAndUpdate(userW._id, { incomeWallet: 0 });

        console.log('Set Y to Rank 1. Upgrading Z to Rank 2 again...');
        const commissions2 = await calculateAndCreateMembershipCommissions(userZ, v2Membership);
        console.log('Commissions created:', commissions2.length);

        const updatedY2 = await User.findById(userY._id);
        if (updatedY2.incomeWallet === 0) {
            console.log('✅ Lower level referrer (Y) correctly received no commission.');
        } else {
            console.error('❌ Lower level referrer (Y) received commission incorrectly!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
