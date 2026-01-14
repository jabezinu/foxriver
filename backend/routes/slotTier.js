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
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

// Public routes
router.get('/', getActiveTiers);

// Admin routes
router.get('/admin/all', protect, adminOnly, checkPermission('manage_slot_machine'), getAllTiers);
router.post('/admin', protect, adminOnly, checkPermission('manage_slot_machine'), createTier);
router.put('/admin/:id', protect, adminOnly, checkPermission('manage_slot_machine'), updateTier);
router.delete('/admin/:id', protect, adminOnly, checkPermission('manage_slot_machine'), deleteTier);
router.patch('/admin/:id/toggle', protect, adminOnly, checkPermission('manage_slot_machine'), toggleTierStatus);

module.exports = router;
