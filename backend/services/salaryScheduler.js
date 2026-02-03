const cron = require('node-cron');
const User = require('../models/User');
const Salary = require('../models/Salary');
const { calculateMonthlySalary } = require('../utils/salary');

/**
 * Process salary for a single user
 * Checks if user is eligible and hasn't been paid this month
 */
const processSalaryForUser = async (user) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-indexed
        const currentYear = now.getFullYear();

        // Check if user has already been paid this month
        const existingSalary = await Salary.findOne({
            where: {
                user: user.id,
                month: currentMonth,
                year: currentYear
            }
        });

        if (existingSalary) {
            return null; // Already paid this month
        }

        // Calculate salary
        const { salary, breakdown } = await calculateMonthlySalary(user.id);

        if (salary > 0) {
            // Get system settings to check wallet destination
            const SystemSetting = require('../models/SystemSetting');
            const settings = await SystemSetting.findOne();
            
            // Credit configured wallet
            const walletField = `${settings?.salaryWallet || 'income'}Wallet`;
            user[walletField] = parseFloat(user[walletField]) + salary;
            user.lastSalaryDate = now;
            await user.save();

            // Log salary payment
            const salaryRecord = await Salary.create({
                user: user.id,
                amount: salary,
                month: currentMonth,
                year: currentYear,
                breakdown: {
                    aLevel: breakdown.aLevel,
                    bLevel: breakdown.bLevel,
                    cLevel: breakdown.cLevel,
                    total: breakdown.total
                },
                ruleApplied: breakdown.salaryComponents[0]?.rule || 'No rule applied'
            });

            console.log(`✓ Salary paid to user ${user.phone}: ${salary} ETB`);
            return salaryRecord;
        }

        return null;
    } catch (error) {
        console.error(`Error processing salary for user ${user.id}:`, error);
        return null;
    }
};

/**
 * Process salaries for all eligible users
 * This runs daily to check if any user needs their monthly salary
 */
const processAllSalaries = async () => {
    try {
        console.log('🔄 Starting automatic salary processing...');
        const startTime = Date.now();

        const users = await User.findAll({ where: { role: 'user', isActive: true } });
        let processedCount = 0;
        let totalPaid = 0;

        for (const user of users) {
            const salaryRecord = await processSalaryForUser(user);
            if (salaryRecord) {
                processedCount++;
                totalPaid += parseFloat(salaryRecord.amount);
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Salary processing complete: ${processedCount} users paid, ${totalPaid} ETB total (${duration}s)`);

        return { processedCount, totalPaid };
    } catch (error) {
        console.error('❌ Error in automatic salary processing:', error);
        throw error;
    }
};

/**
 * Initialize the salary scheduler
 * Runs daily at 00:01 AM to process salaries
 */
const initializeSalaryScheduler = () => {
    // Run every day at 00:01 AM
    cron.schedule('1 0 * * *', async () => {
        console.log('⏰ Daily salary check triggered at', new Date().toISOString());
        await processAllSalaries();
    }, {
        timezone: "Africa/Addis_Ababa" // Ethiopian timezone
    });

    console.log('📅 Salary scheduler initialized - will run daily at 00:01 AM (Ethiopian Time)');
};

/**
 * Process salary for a specific user immediately
 * Used for manual triggers or when user first qualifies
 */
const processSalaryForUserById = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return await processSalaryForUser(user);
};

module.exports = {
    initializeSalaryScheduler,
    processAllSalaries,
    processSalaryForUser,
    processSalaryForUserById
};
