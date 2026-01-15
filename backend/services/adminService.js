const { User, Deposit, Withdrawal, Task, Member, SystemSetting, Commission, TaskCompletion, Membership, Salary, sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminService {
    /**
     * Get aggregated dashboard statistics
     */
    async getDashboardStats() {
        const [
            totalUsers,
            usersByLevel,
            totalDeposits,
            pendingDeposits,
            approvedDeposits,
            totalDepositAmount,
            totalWithdrawals,
            pendingWithdrawals,
            approvedWithdrawals,
            totalWithdrawalAmount,
            totalTasks,
            activeTasks,
            recentUsers
        ] = await Promise.all([
            User.count({ where: { role: 'user' } }),
            User.findAll({
                where: { role: 'user' },
                attributes: ['membershipLevel', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['membershipLevel'],
                raw: true
            }),
            Deposit.count(),
            Deposit.count({ where: { status: { [Op.in]: ['pending', 'ft_submitted'] } } }),
            Deposit.count({ where: { status: 'approved' } }),
            Deposit.findOne({
                where: { status: 'approved' },
                attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
                raw: true
            }),
            Withdrawal.count(),
            Withdrawal.count({ where: { status: 'pending' } }),
            Withdrawal.count({ where: { status: 'approved' } }),
            Withdrawal.findOne({
                where: { status: 'approved' },
                attributes: [[sequelize.fn('SUM', sequelize.col('netAmount')), 'total']],
                raw: true
            }),
            Task.count(),
            Task.count({ where: { status: 'active' } }),
            User.findAll({
                where: { role: 'user' },
                order: [['createdAt', 'DESC']],
                limit: 10,
                attributes: ['id', 'phone', 'membershipLevel', 'createdAt']
            })
        ]);

        return {
            users: { total: totalUsers, byLevel: usersByLevel },
            deposits: {
                total: totalDeposits,
                pending: pendingDeposits,
                approved: approvedDeposits,
                totalAmount: totalDepositAmount?.total || 0
            },
            withdrawals: {
                total: totalWithdrawals,
                pending: pendingWithdrawals,
                approved: approvedWithdrawals,
                totalAmount: totalWithdrawalAmount?.total || 0
            },
            tasks: { total: totalTasks, active: activeTasks },
            recentUsers
        };
    }

    /**
     * Restrict withdrawal for all users
     */
    async restrictAllUsers(date) {
        await User.update(
            { withdrawalRestrictedUntil: date || null },
            { where: { role: 'user' } }
        );
        return true;
    }
}

module.exports = new AdminService();
