const express = require('express');
const router = express.Router();
const {
    getBankAccounts,
    getAllBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount
} = require('../controllers/bankController');
const { protect, adminOnly } = require('../middlewares/auth');

// Public route for clients
router.get('/', getBankAccounts);

// Admin routes
router.get('/admin', protect, adminOnly, getAllBankAccounts);
router.post('/', protect, adminOnly, createBankAccount);
router.put('/:id', protect, adminOnly, updateBankAccount);
router.delete('/:id', protect, adminOnly, deleteBankAccount);

module.exports = router;
