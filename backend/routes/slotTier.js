const express = require('express');
const router = express.Router();
const {
    getActiveTiers,
    getAllTiers,
    createTier,
    updateTier,
    deleteTier,
    toggleTierStatus
} = require('../controllers/slotTierController');
const { protect, adminOnly } = require('../middlewares/auth');

// Public routes
router.get('/', getActiveTiers);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllTiers);
router.post('/admin', protect, adminOnly, createTier);
router.put('/admin/:id', protect, adminOnly, updateTier);
router.delete('/admin/:id', protect, adminOnly, deleteTier);
router.patch('/admin/:id/toggle', protect, adminOnly, toggleTierStatus);

module.exports = router;
