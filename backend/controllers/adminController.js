const {
    User,
    Deposit,
    Withdrawal,
    Task,
    ChatMessage,
    SystemSetting,
    Commission,
    TaskCompletion,
    Membership,
    Salary,
    RankUpgradeRequest,
    WealthInvestment,
    SpinResult,
    DailyVideoAssignment,
    Chat,
    Playlist,
    News,
    QnA,
    sequelize
} = require('../models');
const adminService = require('../services/adminService');
const userService = require('../services/userService');
const { calculateAndCreateMembershipCommissions } = require('../utils/commission');
const { calculateMonthlySalary } = require('../utils/salary');
const { processAllSalaries, processSalaryForUserById } = require('../services/salaryScheduler');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
        success: true,
        stats
    });
});

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
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
});

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password', 'transactionPassword'] },
        include: [{ model: User, as: 'referrer', attributes: ['phone', 'membershipLevel'] }]
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const [deposits, withdrawals, referralCount] = await Promise.all([
        Deposit.findAll({ where: { user: user.id }, order: [['createdAt', 'DESC']], limit: 10 }),
        Withdrawal.findAll({ where: { user: user.id }, order: [['createdAt', 'DESC']], limit: 10 }),
        User.count({ where: { referrerId: user.id } })
    ]);

    // Add password status indicators (not the actual passwords)
    const passwordInfo = {
        hasPassword: !!user.dataValues.password,
        hasTransactionPassword: !!user.dataValues.transactionPassword
    };

    res.status(200).json({
        success: true,
        user: {
            ...user.toJSON(),
            passwordInfo
        },
        deposits,
        withdrawals,
        referralCount
    });
});

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
    const { membershipLevel, incomeWallet, personalWallet, tasksWallet, withdrawalRestrictedUntil, withdrawalRestrictedDays, approveBankChange, password, transactionPassword } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (membershipLevel && membershipLevel !== user.membershipLevel) {
        const oldLevel = user.membershipLevel;
        user.membershipLevel = membershipLevel;

        // If upgraded from Intern, trigger commissions
        if (oldLevel === 'Intern' && membershipLevel !== 'Intern') {
            const membership = await Membership.findOne({ where: { level: membershipLevel } });
            if (membership) {
                await calculateAndCreateMembershipCommissions(user, membership);
            }
        }

        // Invalidate cache when admin changes membership level
        if (oldLevel === 'Intern' && membershipLevel !== 'Intern') {
            const { invalidateReferralChainCache } = require('../utils/cacheInvalidation');
            await invalidateReferralChainCache(user.id);
        }
    }

    if (incomeWallet !== undefined) user.incomeWallet = Number(incomeWallet);
    if (personalWallet !== undefined) user.personalWallet = Number(personalWallet);
    if (tasksWallet !== undefined) user.tasksWallet = Number(tasksWallet);

    if (withdrawalRestrictedUntil !== undefined) {
        user.withdrawalRestrictedUntil = withdrawalRestrictedUntil === '' ? null : withdrawalRestrictedUntil;
    }

    if (withdrawalRestrictedDays !== undefined) {
        user.withdrawalRestrictedDays = withdrawalRestrictedDays;
    }

    // Handle password updates
    if (password && password.trim() !== '') {
        user.password = password;
    }

    // Handle transaction password updates
    if (transactionPassword !== undefined) {
        if (transactionPassword === '' || transactionPassword === null) {
            // Allow clearing transaction password
            user.transactionPassword = null;
        } else if (transactionPassword.trim() !== '') {
            // Validate 6 digits
            if (!/^\d{6}$/.test(transactionPassword)) {
                throw new AppError('Transaction password must be exactly 6 digits', 400);
            }
            user.transactionPassword = transactionPassword;
        }
    }

    // Handle bank change approval
    if (approveBankChange && user.bankChangeStatus === 'pending') {
        const isDuplicate = await userService.isBankAccountDuplicate(
            user.id,
            user.pendingBankAccount.accountNumber,
            user.pendingBankAccount.bank
        );

        if (isDuplicate) {
            throw new AppError('This bank account is already registered to another user', 400);
        }

        user.bankAccount = { ...user.pendingBankAccount, isSet: true };
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
});

// @desc    Restrict withdrawal for all users
// @route   PUT /api/admin/users/restrict-all
// @access  Private/Admin
exports.restrictAllUsers = asyncHandler(async (req, res) => {
    const { date, restrictedDays } = req.body;
    await adminService.restrictAllUsers(date, restrictedDays);

    let message = '';
    if (date) {
        message = 'Withdrawal restriction applied to all users until ' + new Date(date).toLocaleDateString();
    } else if (restrictedDays && restrictedDays.length > 0) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const restrictedDayNames = restrictedDays.map(day => dayNames[day]).join(', ');
        message = `Withdrawal restrictions applied to all users on: ${restrictedDayNames}`;
    } else {
        message = 'Withdrawal restrictions lifted for all users';
    }

    res.status(200).json({
        success: true,
        message
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (userId === req.user.id.toString()) {
        throw new AppError('You cannot delete your own account', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Run deletions in transaction
    await sequelize.transaction(async (t) => {
        // 1. Delete dependent children records that depend on other child records first
        // RankUpgradeRequest depends on Deposit, so delete it first
        await RankUpgradeRequest.destroy({ where: { user: userId }, transaction: t });

        // 2. Delete other independent child records
        await Promise.all([
            Deposit.destroy({ where: { user: userId }, transaction: t }),
            Withdrawal.destroy({ where: { user: userId }, transaction: t }),
            Commission.destroy({
                where: { [Op.or]: [{ user: userId }, { downlineUser: userId }] },
                transaction: t
            }),
            TaskCompletion.destroy({ where: { user: userId }, transaction: t }),
            Salary.destroy({ where: { user: userId }, transaction: t }),
            WealthInvestment.destroy({ where: { user: userId }, transaction: t }),
            SpinResult.destroy({ where: { user: userId }, transaction: t }),
            DailyVideoAssignment.destroy({ where: { user: userId }, transaction: t })
        ]);

        // 2. Handle Chat: Delete messages and the chat session
        const chat = await Chat.findOne({ where: { user: userId }, transaction: t });
        if (chat) {
            await ChatMessage.destroy({ where: { chat: chat.id }, transaction: t });
            await chat.destroy({ transaction: t });
        }
        // Also delete any messages sent by this user in other contexts (if any)
        await ChatMessage.destroy({ where: { sender: userId }, transaction: t });

        // 3. Nullify references for content that should persist (Content Ownership)
        await Promise.all([
            Task.update({ uploadedBy: null }, { where: { uploadedBy: userId }, transaction: t }),
            Playlist.update({ addedBy: null }, { where: { addedBy: userId }, transaction: t }),
            News.update({ createdBy: null }, { where: { createdBy: userId }, transaction: t }),
            QnA.update({ uploadedBy: null }, { where: { uploadedBy: userId }, transaction: t }),
            User.update({ referrerId: null }, { where: { referrerId: userId }, transaction: t })
        ]);

        // 4. Finally delete the user
        await user.destroy({ transaction: t });
    });

    res.status(200).json({
        success: true,
        message: 'User and all related data deleted successfully'
    });
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
exports.updateAdminProfile = asyncHandler(async (req, res) => {
    const { phone, password, currentPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) throw new AppError('User not found', 404);

    if (password) {
        if (!currentPassword) throw new AppError('Current password is required', 400);
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) throw new AppError('Invalid current password', 401);
        user.password = password;
    }

    if (phone) user.phone = phone;
    await user.save();

    res.status(200).json({
        success: true,
        data: { id: user.id, phone: user.phone, role: user.role },
        message: 'Profile updated successfully'
    });
});

// @desc    Get user deposit history
// @route   GET /api/admin/users/:id/deposits
// @access  Private/Admin
exports.getUserDepositHistory = asyncHandler(async (req, res) => {
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
});

// @desc    Get user withdrawal history
// @route   GET /api/admin/users/:id/withdrawals
// @access  Private/Admin
exports.getUserWithdrawalHistory = asyncHandler(async (req, res) => {
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
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSystemSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSetting.findOne();
    if (!settings) settings = await SystemSetting.create({});

    res.status(200).json({
        success: true,
        settings
    });
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSystemSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSetting.findOne();

    if (!settings) {
        settings = await SystemSetting.create(req.body);
    } else {
        await settings.update(req.body);
        await settings.reload();
    }

    res.status(200).json({
        success: true,
        settings,
        message: 'Settings updated successfully'
    });
});

// @desc    Get all commissions
// @route   GET /api/admin/commissions
// @access  Private/Admin
exports.getAllCommissions = asyncHandler(async (req, res) => {
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
});

// @desc    Process monthly salaries for all users
// @route   POST /api/admin/salaries/process
// @access  Private/Admin
exports.processMonthlySalaries = asyncHandler(async (req, res) => {
    const result = await processAllSalaries();
    res.status(200).json({
        success: true,
        message: `Successfully processed salaries for ${result.processedCount} users`,
        ...result
    });
});

// @desc    Process salary for a specific user
// @route   POST /api/admin/salaries/process/:userId
// @access  Private/Admin
exports.processUserSalary = asyncHandler(async (req, res) => {
    const salaryRecord = await processSalaryForUserById(req.params.userId);

    if (!salaryRecord) {
        return res.status(200).json({
            success: true,
            message: 'User either already paid this month or does not qualify',
            paid: false
        });
    }

    res.status(200).json({
        success: true,
        message: `Salary of ${salaryRecord.amount} ETB paid successfully`,
        paid: true,
        salary: salaryRecord
    });
});

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private/SuperAdmin
exports.getAllAdmins = asyncHandler(async (req, res) => {
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
});

// @desc    Update admin permissions or role
// @route   PUT /api/admin/admins/:id/permissions
// @access  Private/SuperAdmin
exports.updateAdminPermissions = asyncHandler(async (req, res) => {
    const { role, permissions } = req.body;
    const adminId = req.params.id;

    if (adminId === req.user.id.toString()) {
        throw new AppError('You cannot change your own permissions via this route', 400);
    }

    const admin = await User.findByPk(adminId);
    if (!admin) throw new AppError('Admin not found', 404);

    if (role) {
        if (!['admin', 'superadmin', 'user'].includes(role)) {
            throw new AppError('Invalid role', 400);
        }
        admin.role = role;
    }

    if (permissions) admin.permissions = permissions;
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        admin
    });
});

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private/SuperAdmin
exports.createAdmin = asyncHandler(async (req, res) => {
    const { phone, password, role, permissions } = req.body;

    const userExists = await User.findOne({ where: { phone } });
    if (userExists) throw new AppError('User already exists', 400);

    const admin = await User.create({
        phone,
        password,
        role: role || 'admin',
        permissions: permissions || [],
        membershipLevel: 'Rank 10',
        isActive: true
    });

    res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin: { id: admin.id, phone: admin.phone, role: admin.role, permissions: admin.permissions }
    });
});

// @desc    Get current global restrictions
// @route   GET /api/admin/users/restrictions
// @access  Private/Admin
exports.getCurrentRestrictions = asyncHandler(async (req, res) => {
    // Get a sample user to check current global restrictions
    const sampleUser = await User.findOne({
        where: { role: 'user' },
        attributes: ['withdrawalRestrictedUntil', 'withdrawalRestrictedDays']
    });

    if (!sampleUser) {
        return res.status(200).json({
            success: true,
            restrictions: {
                dateRestriction: null,
                dayRestrictions: null
            }
        });
    }

    res.status(200).json({
        success: true,
        restrictions: {
            dateRestriction: sampleUser.withdrawalRestrictedUntil,
            dayRestrictions: sampleUser.withdrawalRestrictedDays
        }
    });
});

// @desc    Get user reference tree up to C level
// @route   GET /api/admin/users/:id/reference-tree
// @access  Private/Admin
exports.getUserReferenceTree = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'phone', 'membershipLevel', 'profilePhoto', 'createdAt']
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Helper function to build tree recursively
    const buildReferenceTree = async (parentId, level = 0, maxLevel = 2) => {
        if (level > maxLevel) return [];

        const children = await User.findAll({
            where: { referrerId: parentId },
            attributes: ['id', 'name', 'phone', 'membershipLevel', 'profilePhoto', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        const childrenWithSubtree = await Promise.all(
            children.map(async (child) => {
                const subtree = await buildReferenceTree(child.id, level + 1, maxLevel);
                return {
                    ...child.toJSON(),
                    level: level + 1,
                    levelLabel: level === 0 ? 'A' : level === 1 ? 'B' : 'C',
                    children: subtree,
                    childrenCount: subtree.length,
                    totalDescendants: subtree.reduce((sum, c) => sum + c.totalDescendants + 1, subtree.length)
                };
            })
        );

        return childrenWithSubtree;
    };

    // Build the tree starting from the user
    const referenceTree = await buildReferenceTree(userId);
    
    // Calculate statistics
    const stats = {
        aLevel: referenceTree.length,
        bLevel: referenceTree.reduce((sum, a) => sum + a.children.length, 0),
        cLevel: referenceTree.reduce((sum, a) => 
            sum + a.children.reduce((bSum, b) => bSum + b.children.length, 0), 0
        )
    };
    stats.total = stats.aLevel + stats.bLevel + stats.cLevel;

    res.status(200).json({
        success: true,
        user: user.toJSON(),
        referenceTree,
        stats
    });
});
