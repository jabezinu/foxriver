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
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

const upload = require('../middlewares/upload');

router.post('/create', protect, createDeposit);
router.post('/submit-ft', protect, upload.single('screenshot'), submitTransactionFT);
router.get('/user', protect, getUserDeposits);
router.get('/all', protect, adminOnly, checkPermission('manage_deposits'), getAllDeposits);
router.put('/:id/approve', protect, adminOnly, checkPermission('manage_deposits'), approveDeposit);
router.put('/:id/reject', protect, adminOnly, checkPermission('manage_deposits'), rejectDeposit);

module.exports = router;
