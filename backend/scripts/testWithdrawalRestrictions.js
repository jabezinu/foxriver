const { User } = require('../models');
const userService = require('../services/userService');

async function testWithdrawalRestrictions() {
    try {
        console.log('🧪 Testing withdrawal restriction system...\n');

        // Find a test user (or create one)
        let testUser = await User.findOne({ where: { role: 'user' } });
        
        if (!testUser) {
            console.log('No test user found. Please create a user first.');
            process.exit(1);
        }

        console.log(`📋 Testing with user: ${testUser.phone} (ID: ${testUser.id})`);

        // Test 1: No restrictions
        console.log('\n1️⃣ Testing with no restrictions...');
        testUser.withdrawalRestrictedUntil = null;
        testUser.withdrawalRestrictedDays = null;
        await testUser.save();

        try {
            await userService.canWithdraw(testUser.id);
            console.log('✅ No restrictions - withdrawal allowed');
        } catch (error) {
            console.log('❌ Unexpected restriction:', error.message);
        }

        // Test 2: Date-based restriction (legacy)
        console.log('\n2️⃣ Testing date-based restriction...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        testUser.withdrawalRestrictedUntil = tomorrow;
        testUser.withdrawalRestrictedDays = null;
        await testUser.save();

        try {
            await userService.canWithdraw(testUser.id);
            console.log('❌ Date restriction not working');
        } catch (error) {
            console.log('✅ Date restriction working:', error.message);
        }

        // Test 3: Day-based restriction (current day)
        console.log('\n3️⃣ Testing day-based restriction (today)...');
        const today = new Date().getDay();
        testUser.withdrawalRestrictedUntil = null;
        testUser.withdrawalRestrictedDays = [today]; // Restrict today
        await testUser.save();

        try {
            await userService.canWithdraw(testUser.id);
            console.log('❌ Day restriction not working');
        } catch (error) {
            console.log('✅ Day restriction working:', error.message);
        }

        // Test 4: Day-based restriction (different day)
        console.log('\n4️⃣ Testing day-based restriction (different day)...');
        const differentDay = (today + 1) % 7; // Tomorrow's day
        testUser.withdrawalRestrictedDays = [differentDay];
        await testUser.save();

        try {
            await userService.canWithdraw(testUser.id);
            console.log('✅ Different day restriction - withdrawal allowed');
        } catch (error) {
            console.log('❌ Unexpected restriction:', error.message);
        }

        // Test 5: Multiple restricted days
        console.log('\n5️⃣ Testing multiple restricted days...');
        testUser.withdrawalRestrictedDays = [0, 6]; // Sunday and Saturday
        await testUser.save();

        try {
            await userService.canWithdraw(testUser.id);
            if (today === 0 || today === 6) {
                console.log('❌ Weekend restriction not working');
            } else {
                console.log('✅ Weekend restriction - withdrawal allowed on weekday');
            }
        } catch (error) {
            if (today === 0 || today === 6) {
                console.log('✅ Weekend restriction working:', error.message);
            } else {
                console.log('❌ Unexpected restriction on weekday:', error.message);
            }
        }

        // Clean up
        testUser.withdrawalRestrictedUntil = null;
        testUser.withdrawalRestrictedDays = null;
        await testUser.save();

        console.log('\n🎉 All tests completed!');
        console.log(`📅 Today is: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today]}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testWithdrawal Restrictions();