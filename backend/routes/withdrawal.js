const express = require('express');
const router = express.Router();
const {
    createWithdrawal,
    getUserWithdrawals,
    getAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal
} = require('../controllers/withdrawalController');
const { protect, adminOnly, isV1OrHigher } = require('../middlewares/auth');

router.post('/create', protect, isV1OrHigher, createWithdrawal);
router.get('/user', protect, getUserWithdrawals);
router.get('/all', protect, adminOnly, getAllWithdrawals);
router.put('/:id/approve', protect, adminOnly, approveWithdrawal);
router.put('/:id/reject', protect, adminOnly, rejectWithdrawal);

module.exports = router;
