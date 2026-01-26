const express = require('express');
const router = express.Router();
const {
    createWithdrawal,
    getUserWithdrawals,
    getAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    undoWithdrawal
} = require('../controllers/withdrawalController');
const { protect, adminOnly, isV1OrHigher, checkPermission } = require('../middlewares/auth');

router.post('/create', protect, isV1OrHigher, createWithdrawal);
router.get('/user', protect, getUserWithdrawals);
router.get('/all', protect, adminOnly, checkPermission('manage_withdrawals'), getAllWithdrawals);
router.put('/:id/approve', protect, adminOnly, checkPermission('manage_withdrawals'), approveWithdrawal);
router.put('/:id/reject', protect, adminOnly, checkPermission('manage_withdrawals'), rejectWithdrawal);
router.put('/:id/undo', protect, adminOnly, checkPermission('manage_withdrawals'), undoWithdrawal);

module.exports = router;
