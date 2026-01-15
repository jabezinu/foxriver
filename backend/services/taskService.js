const { Task, TaskCompletion, User, Membership, VideoPool, SystemSetting, sequelize } = require('../models');
const { calculateAndCreateCommissions } = require('../utils/commission');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class TaskService {
    /**
     * Get or generate daily tasks for a user
     */
    async getDailyTasks(userId) {
        const user = await User.findByPk(userId);
        if (!user) throw new AppError('User not found', 404);

        const canInternEarn = user.canInternEarn();
        const internDaysRemaining = user.getInternDaysRemaining();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get system settings
        const settings = await SystemSetting.findOne() || {};

        // 1. Check if tasks are disabled
        if (settings.tasksDisabled) {
            return { tasks: [], isTasksDisabled: true, message: 'Tasks are currently disabled by the administrator.' };
        }

        // 2. Check if it's Sunday
        if (today.getDay() === 0) {
            return { tasks: [], isSunday: true, message: 'Tasks are not available on Sundays.' };
        }

        // 3. Get or generate tasks
        let tasks = await Task.findAll({
            where: {
                createdAt: { [Op.gte]: today, [Op.lt]: tomorrow },
                status: 'active'
            }
        });

        if (tasks.length === 0) {
            tasks = await this._generateTasksFromPool(today);
        }

        // Limit to 4
        tasks = tasks.slice(0, 4);

        // 4. Enrich tasks with completion status and earnings
        const membership = await Membership.findOne({ where: { level: user.membershipLevel } });
        const perVideoIncome = (membership && canInternEarn) ? membership.getPerVideoIncome() : 0;

        const completedTasks = await TaskCompletion.findAll({
            where: {
                user: userId,
                task: { [Op.in]: tasks.map(t => t.id) }
            },
            attributes: ['task']
        });
        const completedTaskIds = completedTasks.map(ct => ct.task);

        const tasksWithDetails = tasks.map(task => ({
            ...task.toJSON(),
            earnings: perVideoIncome,
            isCompleted: completedTaskIds.includes(task.id),
            canEarn: canInternEarn
        }));

        return {
            tasks: tasksWithDetails,
            dailyIncome: membership && canInternEarn ? membership.getDailyIncome() : 0,
            perVideoIncome,
            internRestriction: user.membershipLevel === 'Intern' ? {
                canEarn: canInternEarn,
                daysRemaining: internDaysRemaining,
                activatedAt: user.membershipActivatedAt || user.createdAt
            } : null
        };
    }

    /**
     * Complete a task and credit earnings
     */
    async completeTask(userId, taskId) {
        const today = new Date();
        if (today.getDay() === 0) {
            throw new AppError('Tasks cannot be completed on Sundays', 400);
        }

        const settings = await SystemSetting.findOne() || {};
        if (settings.tasksDisabled) {
            throw new AppError('Tasks are currently disabled', 400);
        }

        const task = await Task.findByPk(taskId);
        if (!task || task.status !== 'active') {
            throw new AppError('Task not found or inactive', 404);
        }

        const user = await User.findByPk(userId);
        if (!user) throw new AppError('User not found', 404);

        // Check completion
        const existingCompletion = await TaskCompletion.findOne({
            where: { user: userId, task: taskId }
        });
        if (existingCompletion) {
            throw new AppError('Task already completed', 400);
        }

        // Check Intern restrictions
        if (user.membershipLevel === 'Intern' && !user.canInternEarn()) {
            throw new AppError('Intern trial period expired', 403);
        }

        const membership = await Membership.findOne({ where: { level: user.membershipLevel } });
        if (!membership) throw new AppError('Membership level not found', 400);

        let earningsAmount = membership.getPerVideoIncome();

        // Handle Intern limits
        if (user.membershipLevel === 'Intern') {
            earningsAmount = await this._calculateInternEarnings(user, earningsAmount);
        }

        // Atomic Transaction (using Sequelize managed transaction or manual)
        return await sequelize.transaction(async (t) => {
            const completion = await TaskCompletion.create({
                user: userId,
                task: taskId,
                earningsAmount
            }, { transaction: t });

            user.incomeWallet = parseFloat(user.incomeWallet) + earningsAmount;
            await user.save({ transaction: t });

            // Referral commissions
            await calculateAndCreateCommissions(completion, earningsAmount, { transaction: t });

            logger.info('Task completed', { userId, taskId, earnings: earningsAmount });
            return { completion, earningsAmount, newBalance: user.incomeWallet };
        });
    }

    /**
     * Intern-specific earnings calculation with limits
     */
    async _calculateInternEarnings(user, requestedAmount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const allTimeEarnings = await TaskCompletion.findOne({
            where: { user: user.id },
            attributes: [[sequelize.fn('SUM', sequelize.col('earningsAmount')), 'total']],
            raw: true
        });
        const lifetimeTotal = parseFloat(allTimeEarnings?.total || 0);

        if (lifetimeTotal >= 200) {
            throw new AppError('Intern lifetime limit (200 ETB) reached', 400);
        }

        const todayEarnings = await TaskCompletion.findOne({
            where: {
                user: user.id,
                completionDate: { [Op.gte]: today }
            },
            attributes: [[sequelize.fn('SUM', sequelize.col('earningsAmount')), 'total']],
            raw: true
        });
        const currentDailyTotal = parseFloat(todayEarnings?.total || 0);

        if (currentDailyTotal >= 50) {
            throw new AppError('Intern daily limit (50 ETB) reached', 400);
        }

        return Math.min(requestedAmount, 50 - currentDailyTotal, 200 - lifetimeTotal);
    }

    /**
     * Generate 4 tasks from the video pool
     */
    async _generateTasksFromPool(date) {
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);

        let availableVideos = await VideoPool.findAll({
            where: {
                [Op.or]: [
                    { lastUsed: { [Op.lt]: yesterday } },
                    { lastUsed: null }
                ]
            }
        });

        if (availableVideos.length < 4) {
            availableVideos = await VideoPool.findAll({
                where: {
                    [Op.or]: [
                        { lastUsed: { [Op.lt]: date } },
                        { lastUsed: null }
                    ]
                }
            });
        }

        availableVideos = availableVideos.sort(() => 0.5 - Math.random());
        const selectedVideos = availableVideos.slice(0, 4);

        if (selectedVideos.length === 0) return [];

        const newTasks = await Task.bulkCreate(selectedVideos.map(v => ({
            videoUrl: v.videoUrl,
            title: v.title,
            status: 'active'
        })));

        await VideoPool.update(
            { lastUsed: date },
            { where: { id: { [Op.in]: selectedVideos.map(v => v.id) } } }
        );

        return newTasks;
    }
}

module.exports = new TaskService();
