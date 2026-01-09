const express = require('express');
const router = express.Router();
const { 
    getTiers, 
    upgradeMembership, 
    getAllTiers, 
    hideMembershipsByRange, 
    unhideMembershipsByRange 
} = require('../controllers/membershipController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/tiers', getTiers);
router.post('/upgrade', protect, upgradeMembership);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllTiers);
router.put('/admin/hide-range', protect, adminOnly, hideMembershipsByRange);
router.put('/admin/unhide-range', protect, adminOnly, unhideMembershipsByRange);

module.exports = router;
