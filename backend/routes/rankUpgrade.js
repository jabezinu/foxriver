const express = require('express');
const {
    createRankUpgradeRequest,
    getUserRankUpgradeRequests,
    cancelRankUpgradeRequest,
    getAllRankUpgradeRequests,
    approveRankUpgradeRequest,
    rejectRankUpgradeRequest
} = require('../controllers/rankUpgradeController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// User routes
router.post('/request', protect, createRankUpgradeRequest);
router.get('/user', protect, getUserRankUpgradeRequests);
router.delete('/:id/cancel', protect, cancelRankUpgradeRequest);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllRankUpgradeRequests);
router.put('/:id/approve', protect, adminOnly, approveRankUpgradeRequest);
router.put('/:id/reject', protect, adminOnly, rejectRankUpgradeRequest);

module.exports = router;