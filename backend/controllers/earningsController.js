const { User, Commission, Salary, TaskCompletion, Task } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get user earnings summary with time periods
// @route   GET /api/earnings/summary
// @access  Private
const getEarningsSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    
    // Calculate date ranges
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Helper function to get earnings for a date range
    const getEarningsForPeriod = async (startDate, endDate) => {
        // Task earnings
        const taskEarnings = await TaskCompletion.sum('earningsAmount', {
            where: {
                user: userId,
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            }
        }) || 0;

        // Commission earnings
        const commissionEarnings = await Commission.sum('amountEarned', {
            where: {
                user: userId,
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            }
        }) || 0;

        // Commission breakdown by level
        const commissionBreakdown = await Commission.findAll({
            where: {
                user: userId,
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            },
            attributes: [
                'level',
                [require('sequelize').fn('SUM', require('sequelize').col('amountEarned')), 'total']
            ],
            group: ['level'],
            raw: true
        });

        const commissionByLevel = {
            A: 0,
            B: 0,
            C: 0
        };

        commissionBreakdown.forEach(item => {
            commissionByLevel[item.level] = parseFloat(item.total) || 0;
        });

        return {
            taskEarnings: parseFloat(taskEarnings),
            commissionEarnings: parseFloat(commissionEarnings),
            commissionByLevel,
            total: parseFloat(taskEarnings) + parseFloat(commissionEarnings)
        };
    };

    // Get salary for current month
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const monthlySalary = await Salary.findOne({
        where: {
            user: userId,
            month: currentMonth,
            year: currentYear
        }
    });

    // Calculate earnings for different periods
    const [todayEarnings, yesterdayEarnings, thisWeekEarnings, thisMonthEarnings] = await Promise.all([
        getEarningsForPeriod(today, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        getEarningsForPeriod(yesterday, today),
        getEarningsForPeriod(thisWeekStart, new Date()),
        getEarningsForPeriod(thisMonthStart, new Date())
    ]);

    // Get total all-time earnings
    const totalTaskEarnings = await TaskCompletion.sum('earningsAmount', {
        where: { user: userId }
    }) || 0;

    const totalCommissionEarnings = await Commission.sum('amountEarned', {
        where: { user: userId }
    }) || 0;

    const totalSalaryEarnings = await Salary.sum('amount', {
        where: { user: userId }
    }) || 0;

    const summary = {
        today: todayEarnings,
        yesterday: yesterdayEarnings,
        thisWeek: thisWeekEarnings,
        thisMonth: thisMonthEarnings,
        monthlySalary: monthlySalary ? {
            amount: parseFloat(monthlySalary.amount),
            breakdown: monthlySalary.breakdown,
            ruleApplied: monthlySalary.ruleApplied
        } : null,
        totals: {
            taskEarnings: parseFloat(totalTaskEarnings),
            commissionEarnings: parseFloat(totalCommissionEarnings),
            salaryEarnings: parseFloat(totalSalaryEarnings),
            allTime: parseFloat(totalTaskEarnings) + parseFloat(totalCommissionEarnings) + parseFloat(totalSalaryEarnings)
        }
    };

    res.status(200).json({
        success: true,
        earnings: summary
    });
});

// @desc    Get detailed earnings history
// @route   GET /api/earnings/history
// @access  Private
const getEarningsHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type, limit = 50, offset = 0 } = req.query;

    let earnings = [];

    if (!type || type === 'all') {
        // Get all earnings types
        const [taskEarnings, commissions, salaries] = await Promise.all([
            TaskCompletion.findAll({
                where: { user: userId },
                include: [{
                    model: Task,
                    as: 'taskDetails',
                    attributes: ['title', 'description']
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            }),
            Commission.findAll({
                where: { user: userId },
                include: [{
                    model: User,
                    as: 'downline',
                    attributes: ['name', 'phone', 'membershipLevel']
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            }),
            Salary.findAll({
                where: { user: userId },
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        ]);

        // Format and combine all earnings
        const formattedTaskEarnings = taskEarnings.map(task => ({
            id: task.id,
            type: 'task',
            amount: parseFloat(task.earningsAmount),
            description: task.taskDetails?.title || 'Task Completion',
            date: task.createdAt,
            details: {
                taskTitle: task.taskDetails?.title,
                watchedSeconds: task.watchedSeconds
            }
        }));

        const formattedCommissions = commissions.map(commission => ({
            id: commission.id,
            type: 'commission',
            amount: parseFloat(commission.amountEarned),
            description: `Level ${commission.level} Commission`,
            date: commission.createdAt,
            details: {
                level: commission.level,
                percentage: parseFloat(commission.percentage),
                downlineName: commission.downline?.name || commission.downline?.phone,
                downlineLevel: commission.downline?.membershipLevel
            }
        }));

        const formattedSalaries = salaries.map(salary => ({
            id: salary.id,
            type: 'salary',
            amount: parseFloat(salary.amount),
            description: `Monthly Salary - ${salary.month}/${salary.year}`,
            date: salary.createdAt,
            details: {
                month: salary.month,
                year: salary.year,
                breakdown: salary.breakdown,
                ruleApplied: salary.ruleApplied
            }
        }));

        earnings = [...formattedTaskEarnings, ...formattedCommissions, ...formattedSalaries]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, parseInt(limit));
    }

    res.status(200).json({
        success: true,
        earnings,
        count: earnings.length
    });
});

module.exports = {
    getEarningsSummary,
    getEarningsHistory
};