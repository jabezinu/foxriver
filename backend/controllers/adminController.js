const { 
    User, 
    Deposit, 
    Withdrawal, 
    Task, 
    Message, 
    SystemSetting, 
    Commission, 
    TaskCompletion, 
    Membership, 
    Salary,
    sequelize 
} = require('../models');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');
const { calculateMonthlySalary } = require('../utils/salary');
const { processAllSalaries, processSalaryForUserById } = require('../services/salaryScheduler');
const { Op } = require('sequelize');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const { sequelize } = require('../config/database');
        const { Op } = require('sequelize');

        // User statistics
        const totalUsers = await User.count({ where: { role: 'user' } });
        const usersByLevel = await User.findAll({
            where: { role: 'user' },
            attributes: [
                'membershipLevel',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['membershipLevel'],
            raw: true
        });

        // Deposit statistics
        const totalDeposits = await Deposit.count();
        const pendingDeposits = await Deposit.count({ 
            where: { status: { [Op.in]: ['pending', 'ft_submitted'] } }
        });
        const approvedDeposits = await Deposit.count({ where: { status: 'approved' } });
        const totalDepositAmount = await Deposit.findOne({
            where: { status: 'approved' },
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });

        // Withdrawal statistics
        const totalWithdrawals = await Withdrawal.count();
        const pendingWithdrawals = await Withdrawal.count({ where: { status: 'pending' } });
        const approvedWithdrawals = await Withdrawal.count({ where: { status: 'approved' } });
        const totalWithdrawalAmount = await Withdrawal.findOne({
            where: { status: 'approved' },
            attributes: [[sequelize.fn('SUM', sequelize.col('netAmount')), 'total']],
            raw: true
        });

        // Task statistics
        const totalTasks = await Task.count();
        const activeTasks = await Task.count({ where: { status: 'active' } });

        // Recent activity
        const recentUsers = await User.findAll({
            where: { role: 'user' },
            order: [['createdAt', 'DESC']],
            limit: 10,
            attributes: ['id', 'phone', 'membershipLevel', 'createdAt']
        });

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
                    totalAmount: totalDepositAmount?.total || 0
                },
                withdrawals: {
                    total: totalWithdrawals,
                    pending: pendingWithdrawals,
                    approved: approvedWithdrawals,
                    totalAmount: totalWithdrawalAmount?.total || 0
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
        const { Op } = require('sequelize');
        const { membershipLevel, search } = req.query;

        const where = { role: 'user' };

        if (membershipLevel) {
            where.membershipLevel = membershipLevel;
        }

        if (search) {
            where.phone = { [Op.like]: `%${search}%` };
        }

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password', 'transactionPassword'] },
            order: [['createdAt', 'DESC']]
        });

        // Calculate salary for each user
        const usersWithSalary = await Promise.all(
            users.map(async (user) => {
                const { salary } = await calculateMonthlySalary(user.id);
                return {
                    ...user.toJSON(),
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
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password', 'transactionPassword'] },
            include: [{ model: User, as: 'referrer', attributes: ['phone', 'membershipLevel'] }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's deposits
        const deposits = await Deposit.findAll({ 
            where: { user: user.id },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Get user's withdrawals
        const withdrawals = await Withdrawal.findAll({ 
            where: { user: user.id },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Get referral count
        const referralCount = await User.count({ where: { referrerId: user.id } });

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
        console.log('Update user request:', { id: req.params.id, body: req.body });
        const { membershipLevel, incomeWallet, personalWallet } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User found:', { id: user.id, currentLevel: user.membershipLevel });

        if (membershipLevel) {
            const oldLevel = user.membershipLevel;
            user.membershipLevel = membershipLevel;

            // If level changed and it's not Intern, trigger commissions
            if (oldLevel !== membershipLevel && membershipLevel !== 'Intern') {
                try {
                    const membership = await Membership.findOne({ where: { level: membershipLevel } });
                    if (membership) {
                        await calculateAndCreateMembershipCommissions(user, membership);
                    } else {
                        console.warn(`Membership level ${membershipLevel} not found in database`);
                    }
                } catch (commissionError) {
                    console.error('Error calculating commissions:', commissionError);
                    // Don't fail the entire update if commission calculation fails
                }
            }
        }
        if (incomeWallet !== undefined) user.incomeWallet = Number(incomeWallet);
        if (personalWallet !== undefined) user.personalWallet = Number(personalWallet);
        if (req.body.withdrawalRestrictedUntil !== undefined) {
            // Handle empty string as null
            user.withdrawalRestrictedUntil = req.body.withdrawalRestrictedUntil === '' ? null : req.body.withdrawalRestrictedUntil;
        }

        // Handle bank change approval
        if (req.body.approveBankChange && user.bankChangeStatus === 'pending') {
            // Check if another user already has this bank account
            const existingUser = await User.findOne({
                where: {
                    id: { [Op.ne]: user.id },
                    [Op.or]: [
                        sequelize.where(
                            sequelize.fn('JSON_EXTRACT', sequelize.col('bankAccount'), '$.accountNumber'),
                            user.pendingBankAccount.accountNumber
                        ),
                        sequelize.where(
                            sequelize.fn('JSON_EXTRACT', sequelize.col('pendingBankAccount'), '$.accountNumber'),
                            user.pendingBankAccount.accountNumber
                        )
                    ]
                }
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
            user.pendingBankAccount = null;
            user.bankChangeRequestDate = null;
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
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
        if (date) {
            await User.update(
                { withdrawalRestrictedUntil: date },
                { where: { role: 'user' } }
            );
        } else {
            // If date is null or empty, lift restriction
            await User.update(
                { withdrawalRestrictedUntil: null },
                { where: { role: 'user' } }
            );
        }

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
        const user = await User.findByPk(userId);

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
        await Deposit.destroy({ where: { user: userId } });

        // 2. Delete user's withdrawals
        await Withdrawal.destroy({ where: { user: userId } });

        // 3. Delete commissions related to user (as receiver or source)
        await Commission.destroy({
            where: {
                [Op.or]: [
                    { user: userId },
                    { downlineUser: userId }
                ]
            }
        });

        // 4. Delete task completions
        await TaskCompletion.destroy({ where: { user: userId } });

        // 5. Handle Messages
        // Delete messages where user is the sender
        await Message.destroy({ where: { sender: userId } });
        // Note: For recipients, this would need custom handling based on your Message model structure

        // 6. Update referred users (set referrerId to null)
        await User.update(
            { referrerId: null },
            { where: { referrerId: userId } }
        );

        // 7. Finally delete the user
        await user.destroy();

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
        let user = await User.findByPk(req.user.id);

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
            const userWithPassword = await User.findByPk(req.user.id);
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
                id: user.id,
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
        const deposits = await Deposit.findAll({ 
            where: { user: req.params.id },
            include: [{ model: User, as: 'approver', attributes: ['phone'] }],
            order: [['createdAt', 'DESC']]
        });

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
        const withdrawals = await Withdrawal.findAll({ 
            where: { user: req.params.id },
            include: [{ model: User, as: 'approver', attributes: ['phone'] }],
            order: [['createdAt', 'DESC']]
        });

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
            await settings.update(req.body);
            settings = await SystemSetting.findOne(); // Refresh the instance
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
        const commissions = await Commission.findAll({
            include: [
                { model: User, as: 'earner', attributes: ['phone', 'membershipLevel'] },
                { model: User, as: 'downline', attributes: ['phone', 'membershipLevel'] }
            ],
            order: [['createdAt', 'DESC']]
        });

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
        const admins = await User.findAll({ 
            where: { role: { [Op.in]: ['admin', 'superadmin'] } },
            attributes: { exclude: ['password', 'transactionPassword'] },
            order: [['createdAt', 'DESC']]
        });

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

        const admin = await User.findByPk(adminId);

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
        const userExists = await User.findOne({ where: { phone } });
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
                id: admin.id,
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
