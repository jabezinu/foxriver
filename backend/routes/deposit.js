const express = require('express');
const router = express.Router();
const {
    createDeposit,
    submitTransactionFT,
    getUserDeposits,
    getAllDeposits,
    approveDeposit,
    rejectDeposit
} = require('../controllers/depositController');
const { protect, adminOnly } = require('../middlewares/auth');

router.post('/create', protect, createDeposit);
router.post('/submit-ft', protect, submitTransactionFT);
router.get('/user', protect, getUserDeposits);
router.get('/all', protect, adminOnly, getAllDeposits);
router.put('/:id/approve', protect, adminOnly, approveDeposit);
router.put('/:id/reject', protect, adminOnly, rejectDeposit);

module.exports = router;
