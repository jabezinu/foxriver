const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Task = require('../models/Task');
const Message = require('../models/Message');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments({ role: 'user' });
        const usersByLevel = await User.aggregate([
            { $match: { role: 'user' } },
            { $group: { _id: '$membershipLevel', count: { $sum: 1 } } }
        ]);

        // Deposit statistics
        const totalDeposits = await Deposit.countDocuments();
        const pendingDeposits = await Deposit.countDocuments({ status: { $in: ['pending', 'ft_submitted'] } });
        const approvedDeposits = await Deposit.countDocuments({ status: 'approved' });
        const totalDepositAmount = await Deposit.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Withdrawal statistics
        const totalWithdrawals = await Withdrawal.countDocuments();
        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
        const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });
        const totalWithdrawalAmount = await Withdrawal.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$netAmount' } } }
        ]);

        // Task statistics
        const totalTasks = await Task.countDocuments();
        const activeTasks = await Task.countDocuments({ status: 'active' });

        // Recent activity
        const recentUsers = await User.find({ role: 'user' })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('phone membershipLevel createdAt');

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    byLevel: usersByLevel
                },
                deposits: {
                    total: totalDeposits,
                    pending: pendingDeposits,
                    approved: approvedDeposits,
                    totalAmount: totalDepositAmount.length > 0 ? totalDepositAmount[0].total : 0
                },
                withdrawals: {
                    total: totalWithdrawals,
                    pending: pendingWithdrawals,
                    approved: approvedWithdrawals,
                    totalAmount: totalWithdrawalAmount.length > 0 ? totalWithdrawalAmount[0].total : 0
                },
                tasks: {
                    total: totalTasks,
                    active: activeTasks
                },
                recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { membershipLevel, search } = req.query;

        let filter = { role: 'user' };

        if (membershipLevel) {
            filter.membershipLevel = membershipLevel;
        }

        if (search) {
            filter.phone = { $regex: search, $options: 'i' };
        }

        const users = await User.find(filter)
            .select('-password -transactionPassword')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -transactionPassword')
            .populate('referrerId', 'phone membershipLevel');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's deposits
        const deposits = await Deposit.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get user's withdrawals
        const withdrawals = await Withdrawal.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get referral count
        const referralCount = await User.countDocuments({ referrerId: user._id });

        res.status(200).json({
            success: true,
            user,
            deposits,
            withdrawals,
            referralCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const { membershipLevel, incomeWallet, personalWallet } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (membershipLevel) user.membershipLevel = membershipLevel;
        if (incomeWallet !== undefined) user.incomeWallet = Number(incomeWallet);
        if (personalWallet !== undefined) user.personalWallet = Number(personalWallet);

        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Update failed'
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Delete failed'
        });
    }
};
