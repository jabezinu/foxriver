const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const Membership = require('../models/Membership');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');

dotenv.config();

async function verifyDynamicCommissions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create/Update settings
        let settings = await SystemSetting.findOne();
        if (!settings) settings = await SystemSetting.create({});

        settings.commissionPercentA = 20; // Change to 20%
        await settings.save();
        console.log('Updated Commission A to 20%');

        // 2. Prepare test data
        let referrer = await User.findOne({ phone: '+251911223344' });
        if (!referrer) {
            referrer = await User.create({
                phone: '+251911223344',
                password: 'password123',
                membershipLevel: 'V10', // High level to ensure eligibility
                invitationCode: 'REF123'
            });
        }

        let invitee = await User.findOne({ phone: '+251911223345' });
        if (!invitee) {
            invitee = await User.create({
                phone: '+251911223345',
                password: 'password123',
                referrerId: referrer._id
            });
        }

        const v1Membership = await Membership.findOne({ level: 'V1' });

        if (!v1Membership) {
            console.log('Missing V1 membership level in DB.');
            process.exit(1);
        }

        // 3. Test commission calculation
        console.log(`Calculating commission for V1 purchase (Price: ${v1Membership.price})`);
        const commissions = await calculateAndCreateMembershipCommissions(invitee, v1Membership);

        const aComm = commissions.find(c => c.level === 'A');
        if (aComm) {
            console.log(`Level A Commission: ${aComm.amountEarned} ETB (${aComm.percentage}%)`);
            const expected = v1Membership.price * 0.20;
            if (aComm.amountEarned === expected) {
                console.log('✅ Dynamic commission setting verified successfully!');
            } else {
                console.error(`❌ Expected ${expected} but got ${aComm.amountEarned}`);
            }
        } else {
            console.log('Referrer level might be too low or limit reached.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyDynamicCommissions();
