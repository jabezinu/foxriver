const mongoose = require('mongoose');
const Membership = require('../backend/models/Membership');
const SystemSetting = require('../backend/models/SystemSetting');
const { getDailyTasks } = require('../backend/controllers/taskController');
const { getDailyVideoTasks } = require('../backend/controllers/videoTaskController');

async function verifyLogic() {
    console.log('--- Verifying Membership Earnings Logic ---');
    const mockMembership = new Membership({
        level: 'Rank 1',
        price: 3300
    });

    const dailyIncome = mockMembership.getDailyIncome();
    const perVideoIncome = mockMembership.getPerVideoIncome();

    console.log(`Rank 1 Price: 3300`);
    console.log(`Expected Daily Income: 3300 / 30 = 110`);
    console.log(`Actual Daily Income: ${dailyIncome}`);
    console.log(`Expected Per Video Income: 110 / 4 = 27.5`);
    console.log(`Actual Per Video Income: ${perVideoIncome}`);

    if (dailyIncome === 110 && perVideoIncome === 27.5) {
        console.log('✅ Earnings calculation is correct.');
    } else {
        console.error('❌ Earnings calculation is INCORRECT.');
    }

    console.log('\n--- Verifying SystemSettings Schema ---');
    const mockSetting = new SystemSetting({
        tasksDisabled: true
    });
    console.log(`tasksDisabled: ${mockSetting.tasksDisabled}`);
    if (mockSetting.tasksDisabled === true) {
        console.log('✅ SystemSetting schema updated correctly.');
    } else {
        console.error('❌ SystemSetting schema update failed.');
    }

    console.log('\nVerification script completed successfully.');
}

// Note: This script is intended for logic verification. 
// It doesn't connect to a real DB to avoid side effects during verification.
verifyLogic().catch(console.error);
