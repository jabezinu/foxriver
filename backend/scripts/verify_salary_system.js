const mongoose = require('mongoose');
const User = require('../models/User');
const Salary = require('../models/Salary');
const SystemSetting = require('../models/SystemSetting');
const { processMonthlySalaries } = require('../controllers/adminController');
require('dotenv').config({ path: 'backend/.env' });

const verifySalary = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Cleanup
        await User.deleteMany({ phone: { $regex: /^\+2519(11|2|3|4)/ } });
        await Salary.deleteMany({});
        await SystemSetting.deleteMany({});

        // Set custom settings
        await SystemSetting.create({
            salaryDirect15Threshold: 10,  // Lowered from 15
            salaryDirect15Amount: 12000,
            salaryDirect20Threshold: 15,  // Lowered from 20
            salaryDirect20Amount: 18000,
            salaryNetwork40Threshold: 30, // Lowered from 40
            salaryNetwork40Amount: 35000
        });
        console.log('Set custom dynamic settings');

        // Create a chain to satisfy rules
        // User W (Admin/Inviter)
        // W has 20 Directs (A) -> Should get 20,000
        // Total Network = 20 (A) + 20 (B) + 1 (C) = 41 -> Should get 48,000 (Highest)

        const userW = await User.create({
            phone: '+251911111111',
            password: 'password123',
            role: 'user',
            membershipLevel: 'V10'
        });

        console.log('Created User W');

        // Create 20 A-level users
        const aLevelUsers = [];
        for (let i = 0; i < 20; i++) {
            const u = await User.create({
                phone: `+25192${String(i).padStart(7, '0')}`,
                password: 'password123',
                referrerId: userW._id,
                membershipLevel: 'V1'
            });
            aLevelUsers.push(u);
        }
        console.log('Created 20 A-level users');

        // Create 20 B-level users
        const bLevelUsers = [];
        for (let i = 0; i < 20; i++) {
            const u = await User.create({
                phone: `+25193${String(i).padStart(7, '0')}`,
                password: 'password123',
                referrerId: aLevelUsers[0]._id,
                membershipLevel: 'V1'
            });
            bLevelUsers.push(u);
        }
        console.log('Created 20 B-level users');

        // Create 1 C-level user
        await User.create({
            phone: '+251940000000',
            password: 'password123',
            referrerId: bLevelUsers[0]._id,
            membershipLevel: 'V1'
        });
        console.log('Created 1 C-level user');

        // Total = 20 + 20 + 1 = 41
        // Expected Salary: 48,000

        console.log('--- Processing Salaries ---');
        const req = {};
        const res = {
            status: function (code) { this.statusCode = code; return this; },
            json: function (data) { this.data = data; return this; }
        };

        await processMonthlySalaries(req, res);
        console.log('Res:', res.data);

        const updatedW = await User.findById(userW._id);
        console.log('User W Balance:', updatedW.incomeWallet);
        console.log('Last Salary Date:', updatedW.lastSalaryDate);

        if (updatedW.incomeWallet === 35000) {
            console.log('✅ Dynamic salary calculation passed (35,000 ETB)');
        } else {
            console.log('❌ Dynamic salary calculation failed. Expected 35,000, got', updatedW.incomeWallet);
        }

        // Test Double Payment Prevention
        console.log('--- Processing Salaries Again (Should Skip) ---');
        await processMonthlySalaries(req, res);
        console.log('Res:', res.data);

        const finalW = await User.findById(userW._id);
        if (finalW.incomeWallet === 35000) {
            console.log('✅ Double payment prevention passed');
        } else {
            console.log('❌ Double payment prevention failed');
        }

        const salaryLog = await Salary.findOne({ user: userW._id });
        console.log('Salary Log:', salaryLog);

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifySalary();
