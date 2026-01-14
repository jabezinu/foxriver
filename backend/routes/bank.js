const express = require('express');
const router = express.Router();
const {
    getBankAccounts,
    getAllBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount
} = require('../controllers/bankController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

// Public route for clients
router.get('/', getBankAccounts);

// Admin routes
router.get('/admin', protect, adminOnly, checkPermission('manage_bank_settings'), getAllBankAccounts);
router.post('/', protect, adminOnly, checkPermission('manage_bank_settings'), createBankAccount);
router.put('/:id', protect, adminOnly, checkPermission('manage_bank_settings'), updateBankAccount);
router.delete('/:id', protect, adminOnly, checkPermission('manage_bank_settings'), deleteBankAccount);

module.exports = router;
