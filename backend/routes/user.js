const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    getWalletBalance,
    setBankAccount,
    confirmBankChange,
    cancelBankChange,
    setTransactionPassword,
    changeLoginPassword,
    getReferralLink
} = require('../controllers/userController');
const { protect, isV1OrHigher } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.delete('/profile-photo', protect, deleteProfilePhoto);
router.get('/wallet', protect, getWalletBalance);
router.put('/bank-account', protect, setBankAccount);
router.post('/bank-account/confirm', protect, confirmBankChange);
router.delete('/bank-account/pending', protect, cancelBankChange);
router.put('/transaction-password', protect, isV1OrHigher, setTransactionPassword);
router.put('/login-password', protect, changeLoginPassword);
router.get('/referral-link', protect, getReferralLink);

module.exports = router;
