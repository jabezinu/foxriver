const express = require('express');
const router = express.Router();
const {
    getDownline,
    getCommissions,
    getMonthlySalary
} = require('../controllers/referralController');
const { protect } = require('../middlewares/auth');

router.get('/downline', protect, getDownline);
router.get('/commissions', protect, getCommissions);
router.get('/salary', protect, getMonthlySalary);

module.exports = router;
