const express = require('express');
const router = express.Router();
const {
    spinWheel,
    getUserSpinHistory,
    getAllSpinResults
} = require('../controllers/spinController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

// User routes
router.post('/', protect, spinWheel);
router.get('/history', protect, getUserSpinHistory);

// Admin routes
router.get('/admin/all', protect, adminOnly, checkPermission('manage_slot_machine'), getAllSpinResults);

module.exports = router;
