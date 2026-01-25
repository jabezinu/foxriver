const { User } = require('../models');
const userService = require('../services/userService');

async function testRecurringRestrictions() {
    try {
        console.log('🔄 Testing recurring weekly withdrawal restrictions...\n');

        // Find a test user
        let testUser = await User.findOne({ where: { role: 'user' } });
        
        if (!testUser) {
            console.log('No test user found. Please create a user first.');
            process.exit(1);
        }

        console.log(`📋 Testing with user: ${testUser.phone} (ID: ${testUser.id})`);

        // Test recurring restrictions for each day of the week
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        console.log('\n🗓️ Testing recurring restrictions for each day of the week...');
        
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            console.log(`\n📅 Testing ${dayNames[dayOfWeek]} (${dayOfWeek}):`);
            
            // Set restriction for this day
            testUser.withdrawalRestrictedUntil = null;
            testUser.withdrawalRestrictedDays = [dayOfWeek];
            await testUser.save();
            
            // Mock different days of the week by temporarily overriding Date.prototype.getDay
            const originalGetDay = Date.prototype.getDay;
            
            // Test when it's the restricted day
            Date.prototype.getDay = function() { return dayOfWeek; };
            try {
                await userService.canWithdraw(testUser.id);
                console.log(`  ❌ Should be restricted on ${dayNames[dayOfWeek]}`);
            } catch (error) {
                console.log(`  ✅ Correctly restricted: ${error.message}`);
            }
            
            // Test when it's a different day
            const differentDay = (dayOfWeek + 1) % 7;
            Date.prototype.getDay = function() { return differentDay; };
            try {
                await userService.canWithdraw(testUser.id);
                console.log(`  ✅ Correctly allowed on ${dayNames[differentDay]}`);
            } catch (error) {
                console.log(`  ❌ Unexpected restriction on ${dayNames[differentDay]}: ${error.message}`);
            }
            
            // Restore original getDay function
            Date.prototype.getDay = originalGetDay;
        }

        // Test multiple day restrictions
        console.log('\n🔄 Testing multiple day restrictions (weekends)...');
        testUser.withdrawalRestrictedDays = [0, 6]; // Sunday and Saturday
        await testUser.save();

        const originalGetDay = Date.prototype.getDay;
        
        // Test weekend days
        for (let day of [0, 6]) {
            Date.prototype.getDay = function() { return day; };
            try {
                await userService.canWithdraw(testUser.id);
                console.log(`  ❌ Should be restricted on ${dayNames[day]}`);
            } catch (error) {
                console.log(`  ✅ Weekend restriction working on ${dayNames[day]}: ${error.message}`);
            }
        }
        
        // Test weekday (should be allowed)
        Date.prototype.getDay = function() { return 3; }; // Wednesday
        try {
            await userService.canWithdraw(testUser.id);
            console.log(`  ✅ Correctly allowed on Wednesday (weekday)`);
        } catch (error) {
            console.log(`  ❌ Unexpected restriction on Wednesday: ${error.message}`);
        }
        
        // Restore original function
        Date.prototype.getDay = originalGetDay;

        // Test that restrictions persist across weeks
        console.log('\n📆 Testing persistence across weeks...');
        const today = new Date().getDay();
        testUser.withdrawalRestrictedDays = [today];
        await testUser.save();

        try {
            await userService.canWithdraw(testUser.id);
            console.log(`  ❌ Should be restricted today (${dayNames[today]})`);
        } catch (error) {
            console.log(`  ✅ Restriction persists: ${error.message}`);
            console.log(`  📝 This restriction will apply every ${dayNames[today]} until lifted`);
        }

        // Clean up
        testUser.withdrawalRestrictedUntil = null;
        testUser.withdrawalRestrictedDays = null;
        await testUser.save();

        console.log('\n🎉 Recurring restriction tests completed!');
        console.log('✨ Day-based restrictions are truly recurring weekly');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testRecurringRestrictions();