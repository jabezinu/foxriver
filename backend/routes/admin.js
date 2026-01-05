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
    getUserWithdrawalHistory
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/restrict-all', protect, adminOnly, restrictAllUsers);
router.get('/users/:id', protect, adminOnly, getUserDetails);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/users/:id/deposits', protect, adminOnly, getUserDepositHistory);
router.get('/users/:id/withdrawals', protect, adminOnly, getUserWithdrawalHistory);
router.put('/profile', protect, adminOnly, updateAdminProfile);

module.exports = router;
