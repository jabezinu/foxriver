const { User, TaskCompletion, Commission, Salary, Task } = require('../models');
const { sequelize } = require('../config/database');

async function addSampleEarnings() {
    try {
        // Find a test user (you can replace this with a specific user ID)
        const user = await User.findOne({ where: { role: 'user' } });
        
        if (!user) {
            console.log('No user found to add sample earnings');
            return;
        }

        console.log(`Adding sample earnings for user: ${user.phone}`);

        // Create sample tasks for different completions
        const tasks = [];
        for (let i = 0; i < 4; i++) {
            const task = await Task.create({
                videoUrl: `https://example.com/video${i + 1}.mp4`,
                title: `Sample Task ${i + 1}`,
                status: 'active'
            });
            tasks.push(task);
        }

        // Add some task completions for different time periods
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - 3);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Today's earnings
        await TaskCompletion.create({
            user: user.id,
            task: tasks[0].id,
            earningsAmount: 25.00,
            watchedSeconds: 30,
            requiredWatchTime: 15,
            createdAt: today
        });

        // Yesterday's earnings
        await TaskCompletion.create({
            user: user.id,
            task: tasks[1].id,
            earningsAmount: 30.00,
            watchedSeconds: 35,
            requiredWatchTime: 15,
            createdAt: yesterday
        });

        // This week's earnings
        await TaskCompletion.create({
            user: user.id,
            task: tasks[2].id,
            earningsAmount: 20.00,
            watchedSeconds: 25,
            requiredWatchTime: 15,
            createdAt: thisWeek
        });

        // This month's earnings
        await TaskCompletion.create({
            user: user.id,
            task: tasks[3].id,
            earningsAmount: 15.00,
            watchedSeconds: 20,
            requiredWatchTime: 15,
            createdAt: thisMonth
        });

        // Add some commission earnings if user has referrals
        const referrals = await User.findAll({ where: { referrerId: user.id } });
        
        if (referrals.length > 0) {
            const referral = referrals[0];
            
            // Add commission from today
            await Commission.create({
                user: user.id,
                downlineUser: referral.id,
                level: 'A',
                percentage: 10.00,
                amountEarned: 5.00,
                createdAt: today
            });

            // Add commission from this week
            await Commission.create({
                user: user.id,
                downlineUser: referral.id,
                level: 'A',
                percentage: 10.00,
                amountEarned: 8.00,
                createdAt: thisWeek
            });
        }

        // Add monthly salary
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        await Salary.findOrCreate({
            where: { 
                user: user.id, 
                month: currentMonth, 
                year: currentYear 
            },
            defaults: {
                user: user.id,
                amount: 150.00,
                month: currentMonth,
                year: currentYear,
                breakdown: {
                    directReferrals: 5,
                    networkSize: 12,
                    baseAmount: 100.00,
                    bonusAmount: 50.00
                },
                ruleApplied: 'Direct 10+ Rule'
            }
        });

        console.log('Sample earnings data added successfully!');
        console.log(`User ID: ${user.id}`);
        console.log(`Phone: ${user.phone}`);

    } catch (error) {
        console.error('Error adding sample earnings:', error);
    }
}

// Run if called directly
if (require.main === module) {
    addSampleEarnings().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { addSampleEarnings };