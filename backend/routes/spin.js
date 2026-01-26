const express = require('express');
const router = express.Router();
const {
    spinWheel,
    getUserSpinHistory,
    getAllSpinResults,
    getMonthlyWinners
} = require('../controllers/spinController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

// User routes
router.post('/', protect, spinWheel);
router.get('/history', protect, getUserSpinHistory);
router.get('/monthly-winners', protect, getMonthlyWinners);

// Admin routes
router.get('/admin/all', protect, adminOnly, checkPermission('manage_slot_machine'), getAllSpinResults);

module.exports = router;
