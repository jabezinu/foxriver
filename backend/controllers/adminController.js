const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Task = require('../models/Task');
const Message = require('../models/Message');
const SystemSetting = require('../models/SystemSetting');
const Commission = require('../models/Commission');
const TaskCompletion = require('../models/TaskCompletion');
const Membership = require('../models/Membership');
const Salary = require('../models/Salary');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');
const { calculateMonthlySalary } = require('../utils/salary');
const { processAllSalaries, processSalaryForUserById } = require('../services/salaryScheduler');

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

        // Calculate salary for each user
        const usersWithSalary = await Promise.all(
            users.map(async (user) => {
                const { salary } = await calculateMonthlySalary(user._id);
                return {
                    ...user.toObject(),
                    monthlySalary: salary
                };
            })
        );

        res.status(200).json({
            success: true,
            count: usersWithSalary.length,
            users: usersWithSalary
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

        if (membershipLevel) {
            const oldLevel = user.membershipLevel;
            user.membershipLevel = membershipLevel;

            // If level changed and it's not Intern, trigger commissions
            if (oldLevel !== membershipLevel && membershipLevel !== 'Intern') {
                const membership = await Membership.findOne({ level: membershipLevel });
                if (membership) {
                    await calculateAndCreateMembershipCommissions(user, membership);
                }
            }
        }
        if (incomeWallet !== undefined) user.incomeWallet = Number(incomeWallet);
        if (personalWallet !== undefined) user.personalWallet = Number(personalWallet);
        if (req.body.withdrawalRestrictedUntil !== undefined) {
            user.withdrawalRestrictedUntil = req.body.withdrawalRestrictedUntil;
        }

        // Handle bank change approval
        if (req.body.approveBankChange && user.bankChangeStatus === 'pending') {
            // Check if another user already has this bank account
            const existingUser = await User.findOne({
                _id: { $ne: user._id },
                $or: [
                    { 'bankAccount.accountNumber': user.pendingBankAccount.accountNumber, 'bankAccount.bank': user.pendingBankAccount.bank },
                    { 'pendingBankAccount.accountNumber': user.pendingBankAccount.accountNumber, 'pendingBankAccount.bank': user.pendingBankAccount.bank }
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'This bank account is already registered to another user'
                });
            }

            user.bankAccount = {
                ...user.pendingBankAccount,
                isSet: true
            };
            user.bankChangeStatus = 'none';
            user.pendingBankAccount = undefined;
            user.bankChangeRequestDate = undefined;
        }

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

// @desc    Restrict withdrawal for all users
// @route   PUT /api/admin/users/restrict-all
// @access  Private/Admin
exports.restrictAllUsers = async (req, res) => {
    try {
        const { date } = req.body;

        // Determine update operation
        let updateOperation;
        if (date) {
            updateOperation = { $set: { withdrawalRestrictedUntil: date } };
        } else {
            // If date is null or empty, lift restriction
            updateOperation = { $unset: { withdrawalRestrictedUntil: 1 } };
        }

        await User.updateMany(
            { role: 'user' },
            updateOperation
        );

        res.status(200).json({
            success: true,
            message: date
                ? 'Withdrawal restriction applied to all users'
                : 'Withdrawal restrictions lifted for all users'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Operation failed'
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admins from deleting themselves
        if (userId === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        // 1. Delete user's deposits
        await Deposit.deleteMany({ user: userId });

        // 2. Delete user's withdrawals
        await Withdrawal.deleteMany({ user: userId });

        // 3. Delete commissions related to user (as receiver or source)
        await Commission.deleteMany({
            $or: [
                { user: userId },
                { downlineUser: userId }
            ]
        });

        // 4. Delete task completions
        await TaskCompletion.deleteMany({ user: userId });

        // 5. Handle Messages
        // Delete messages where user is the sender
        await Message.deleteMany({ sender: userId });
        // Remove user from recipients of other messages
        await Message.updateMany(
            { 'recipients.user': userId },
            { $pull: { recipients: { user: userId } } }
        );

        // 6. Update referred users (set referrerId to null)
        await User.updateMany(
            { referrerId: userId },
            { $set: { referrerId: null } }
        );

        // 7. Finally delete the user
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User and all related data deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Delete failed'
        });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
exports.updateAdminProfile = async (req, res) => {
    try {
        const { phone, password, currentPassword } = req.body;

        // Find user
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Handle password change security
        if (password) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to set a new password'
                });
            }

            // Get user with password field
            const userWithPassword = await User.findById(req.user.id).select('+password');
            const isMatch = await userWithPassword.matchPassword(currentPassword);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid current password'
                });
            }

            user.password = password;
        }

        if (phone) user.phone = phone;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                phone: user.phone,
                role: user.role
            },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Profile update failed'
        });
    }
};

// @desc    Get user deposit history
// @route   GET /api/admin/users/:id/deposits
// @access  Private/Admin
exports.getUserDepositHistory = async (req, res) => {
    try {
        const deposits = await Deposit.find({ user: req.params.id })
            .populate('approvedBy', 'phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: deposits.length,
            deposits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get user withdrawal history
// @route   GET /api/admin/users/:id/withdrawals
// @access  Private/Admin
exports.getUserWithdrawalHistory = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ user: req.params.id })
            .populate('approvedBy', 'phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: withdrawals.length,
            withdrawals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();

        if (!settings) {
            settings = await SystemSetting.create({});
        }

        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();

        if (!settings) {
            settings = await SystemSetting.create(req.body);
        } else {
            settings = await SystemSetting.findByIdAndUpdate(
                settings._id,
                req.body,
                { new: true, runValidators: true }
            );
        }

        res.status(200).json({
            success: true,
            settings,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all commissions
// @route   GET /api/admin/commissions
// @access  Private/Admin
exports.getAllCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find()
            .populate('user', 'phone membershipLevel')
            .populate('downlineUser', 'phone membershipLevel')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: commissions.length,
            commissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Process monthly salaries for all users
// @route   POST /api/admin/salaries/process
// @access  Private/Admin
exports.processMonthlySalaries = async (req, res) => {
    try {
        const result = await processAllSalaries();

        res.status(200).json({
            success: true,
            message: `Successfully processed salaries for ${result.processedCount} users`,
            processedCount: result.processedCount,
            totalPaid: result.totalPaid
        });
    } catch (error) {
        console.error('Error processing salaries:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing salaries'
        });
    }
};

// @desc    Process salary for a specific user
// @route   POST /api/admin/salaries/process/:userId
// @access  Private/Admin
exports.processUserSalary = async (req, res) => {
    try {
        const salaryRecord = await processSalaryForUserById(req.params.userId);

        if (!salaryRecord) {
            return res.status(200).json({
                success: true,
                message: 'User either already paid this month or does not qualify for salary',
                paid: false
            });
        }

        res.status(200).json({
            success: true,
            message: `Salary of ${salaryRecord.amount} ETB paid successfully`,
            paid: true,
            salary: salaryRecord
        });
    } catch (error) {
        console.error('Error processing user salary:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing salary'
        });
    }
};
// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private/SuperAdmin
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
            .select('-password -transactionPassword')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: admins.length,
            admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update admin permissions or role
// @route   PUT /api/admin/admins/:id/permissions
// @access  Private/SuperAdmin
exports.updateAdminPermissions = async (req, res) => {
    try {
        const { role, permissions } = req.body;
        const adminId = req.params.id;

        // Prevent superadmin from downgrading themselves via this route
        // (though they could technically do it via profile update if not careful, 
        // but here we restrict the admin management route)
        if (adminId === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own permissions or role via this route'
            });
        }

        const admin = await User.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (role) {
            if (!['admin', 'superadmin', 'user'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role'
                });
            }
            admin.role = role;
        }

        if (permissions) {
            admin.permissions = permissions;
        }

        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private/SuperAdmin
exports.createAdmin = async (req, res) => {
    try {
        const { phone, password, role, permissions } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this phone number already exists'
            });
        }

        const admin = await User.create({
            phone,
            password,
            role: role || 'admin',
            permissions: permissions || [],
            membershipLevel: 'Rank 10', // Admins get max rank
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                phone: admin.phone,
                role: admin.role,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
