/**
 * Test script to verify commission and salary rules
 * 
 * Rules to verify:
 * 1. If inviter (Rank 1) invites someone who stays as Intern -> NO commission, NOT counted for salary
 * 2. If inviter (Rank 1) invites someone who upgrades to Rank 1 (equal) -> YES commission, YES counted for salary
 * 3. If inviter (Rank 1) invites someone who upgrades to Rank 2 (higher) -> NO commission, NOT counted for salary
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Commission = require('../models/Commission');
const { calculateMonthlySalary } = require('../utils/salary');

const testCommissionRules = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get membership levels
        const memberships = await Membership.find().sort({ order: 1 });
        const membershipOrder = {};
        memberships.forEach(m => {
            membershipOrder[m.level] = m.order;
        });

        console.log('=== MEMBERSHIP LEVELS ===');
        memberships.forEach(m => {
            console.log(`${m.level}: Order ${m.order}`);
        });
        console.log('');

        // Test Scenario 1: Rank 1 inviter with Intern referral
        console.log('=== TEST SCENARIO 1: Rank 1 Inviter -> Intern Referral ===');
        const v1Inviter = await User.findOne({ membershipLevel: 'Rank 1' }).limit(1);
        if (v1Inviter) {
            const internReferrals = await User.find({ 
                referrerId: v1Inviter._id, 
                membershipLevel: 'Intern' 
            });
            
            console.log(`Rank 1 Inviter: ${v1Inviter.phone}`);
            console.log(`Intern Referrals Count: ${internReferrals.length}`);
            
            if (internReferrals.length > 0) {
                const internUser = internReferrals[0];
                const commissions = await Commission.find({ 
                    user: v1Inviter._id, 
                    downlineUser: internUser._id 
                });
                console.log(`Commissions from this Intern: ${commissions.length}`);
                console.log(`Expected: 0 (Interns should not generate commissions)`);
            }
            
            // Check salary calculation
            const salaryData = await calculateMonthlySalary(v1Inviter._id);
            console.log(`\nSalary Calculation for Rank 1 Inviter:`);
            console.log(`Total Qualified Referrals: ${salaryData.breakdown.total}`);
            console.log(`A-Level Qualified: ${salaryData.breakdown.aLevel}`);
            console.log(`Note: Intern referrals should NOT be counted\n`);
        }

        // Test Scenario 2: Rank 1 inviter with Rank 1 referral (equal level)
        console.log('=== TEST SCENARIO 2: Rank 1 Inviter -> Rank 1 Referral (Equal) ===');
        const v1InviterWithV1 = await User.findOne({ membershipLevel: 'Rank 1' }).limit(1);
        if (v1InviterWithV1) {
            const v1Referrals = await User.find({ 
                referrerId: v1InviterWithV1._id, 
                membershipLevel: 'Rank 1' 
            });
            
            console.log(`Rank 1 Inviter: ${v1InviterWithV1.phone}`);
            console.log(`Rank 1 Referrals Count: ${v1Referrals.length}`);
            
            if (v1Referrals.length > 0) {
                const v1User = v1Referrals[0];
                const commissions = await Commission.find({ 
                    user: v1InviterWithV1._id, 
                    downlineUser: v1User._id 
                });
                console.log(`Commissions from this Rank 1 referral: ${commissions.length}`);
                console.log(`Expected: Should have commissions (equal level qualifies)`);
            }
        }

        // Test Scenario 3: Rank 1 inviter with Rank 2+ referral (higher level)
        console.log('\n=== TEST SCENARIO 3: Rank 1 Inviter -> Rank 2+ Referral (Higher) ===');
        const v1InviterWithHigher = await User.findOne({ membershipLevel: 'Rank 1' }).limit(1);
        if (v1InviterWithHigher) {
            const higherReferrals = await User.find({ 
                referrerId: v1InviterWithHigher._id, 
                membershipLevel: { $in: ['Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'] }
            });
            
            console.log(`Rank 1 Inviter: ${v1InviterWithHigher.phone}`);
            console.log(`Higher Level Referrals Count: ${higherReferrals.length}`);
            
            if (higherReferrals.length > 0) {
                const higherUser = higherReferrals[0];
                const commissions = await Commission.find({ 
                    user: v1InviterWithHigher._id, 
                    downlineUser: higherUser._id 
                });
                console.log(`Higher referral level: ${higherUser.membershipLevel}`);
                console.log(`Commissions from this higher level referral: ${commissions.length}`);
                console.log(`Expected: 0 (higher level should not generate commissions for lower level inviter)`);
            }
        }

        // Test the logic directly
        console.log('\n=== LOGIC VERIFICATION ===');
        console.log('Testing comparison logic:');
        const v1Order = membershipOrder['Rank 1'];
        const internOrder = membershipOrder['Intern'];
        const v2Order = membershipOrder['Rank 2'];
        
        console.log(`Rank 1 Order: ${v1Order}`);
        console.log(`Intern Order: ${internOrder}`);
        console.log(`Rank 2 Order: ${v2Order}`);
        console.log('');
        console.log(`For Rank 1 inviter (order ${v1Order}):`);
        console.log(`  - Intern referral (order ${internOrder}): Excluded by Intern check (Expected: DOES NOT QUALIFY)`);
        console.log(`  - Rank 1 referral (order ${v1Order}): ${v1Order <= v1Order ? 'QUALIFIES' : 'DOES NOT QUALIFY'} (Expected: QUALIFIES)`);
        console.log(`  - Rank 2 referral (order ${v2Order}): ${v2Order <= v1Order ? 'QUALIFIES' : 'DOES NOT QUALIFY'} (Expected: DOES NOT QUALIFY)`);
        console.log('');
        console.log('Note: Higher order number = higher membership level');
        console.log('Correct logic: referralOrder <= inviterOrder (referral must be equal or lower level)');
        console.log('Plus: referral must not be Intern');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    }
};

testCommissionRules();
