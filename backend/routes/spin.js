const express = require('express');
const router = express.Router();
const {
    spinWheel,
    getUserSpinHistory,
    getAllSpinResults
} = require('../controllers/spinController');
const { protect, adminOnly } = require('../middlewares/auth');

// User routes
router.post('/', protect, spinWheel);
router.get('/history', protect, getUserSpinHistory);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllSpinResults);

module.exports = router;
