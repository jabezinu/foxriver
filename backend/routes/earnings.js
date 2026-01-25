const express = require('express');
const router = express.Router();
const {
    getEarningsSummary,
    getEarningsHistory
} = require('../controllers/earningsController');
const { protect } = require('../middlewares/auth');

router.get('/summary', protect, getEarningsSummary);
router.get('/history', protect, getEarningsHistory);

module.exports = router;