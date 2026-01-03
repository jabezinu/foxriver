const express = require('express');
const router = express.Router();
const {
    getProfile,
    getWalletBalance,
    setBankAccount,
    setTransactionPassword,
    changeLoginPassword,
    getReferralLink
} = require('../controllers/userController');
const { protect, isV1OrHigher } = require('../middlewares/auth');

router.get('/profile', protect, getProfile);
router.get('/wallet', protect, getWalletBalance);
router.put('/bank-account', protect, setBankAccount);
router.put('/transaction-password', protect, isV1OrHigher, setTransactionPassword);
router.put('/login-password', protect, changeLoginPassword);
router.get('/referral-link', protect, getReferralLink);

module.exports = router;
