const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    updateAdminProfile,
    restrictAllUsers,
    getUserDepositHistory,
    getUserWithdrawalHistory,
    getSystemSettings,
    updateSystemSettings,
    getAllCommissions,
    processMonthlySalaries,
    processUserSalary,
    getAllAdmins,
    updateAdminPermissions,
    createAdmin,
    getUserReferenceTree,
    getCurrentRestrictions
} = require('../controllers/adminController');
const { protect, adminOnly, superAdminOnly, checkPermission } = require('../middlewares/auth');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, checkPermission('manage_users'), getAllUsers);
router.get('/users/restrictions', protect, adminOnly, checkPermission('manage_users'), getCurrentRestrictions);
router.put('/users/restrict-all', protect, adminOnly, checkPermission('manage_users'), restrictAllUsers);
router.get('/users/:id', protect, adminOnly, checkPermission('manage_users'), getUserDetails);
router.get('/users/:id/reference-tree', protect, adminOnly, checkPermission('manage_users'), getUserReferenceTree);
router.put('/users/:id', protect, adminOnly, checkPermission('manage_users'), updateUser);
router.delete('/users/:id', protect, adminOnly, checkPermission('manage_users'), deleteUser);
router.get('/users/:id/deposits', protect, adminOnly, checkPermission('manage_users'), getUserDepositHistory);
router.get('/users/:id/withdrawals', protect, adminOnly, checkPermission('manage_users'), getUserWithdrawalHistory);
router.put('/profile', protect, adminOnly, updateAdminProfile);

router.get('/settings', protect, adminOnly, checkPermission('manage_system_settings'), getSystemSettings);
router.put('/settings', protect, adminOnly, checkPermission('manage_system_settings'), updateSystemSettings);
router.get('/commissions', protect, adminOnly, checkPermission('manage_referrals'), getAllCommissions);
router.post('/salaries/process', protect, adminOnly, checkPermission('manage_membership'), processMonthlySalaries);
router.post('/salaries/process/:userId', protect, adminOnly, checkPermission('manage_membership'), processUserSalary);

// Super Admin Only routes for Admin Management
router.get('/admins', protect, superAdminOnly, getAllAdmins);
router.post('/admins', protect, superAdminOnly, createAdmin);
router.put('/admins/:id/permissions', protect, superAdminOnly, updateAdminPermissions);
router.delete('/admins/:id', protect, superAdminOnly, deleteUser); // Use existing deleteUser but only for superadmin access here

module.exports = router;
