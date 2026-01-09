const express = require('express');
const router = express.Router();
const { 
    getTiers, 
    upgradeMembership, 
    getAllTiers, 
    hideMembershipsByRange, 
    unhideMembershipsByRange,
    setRestrictedRange,
    getRestrictedRange,
    clearRestrictedRange
} = require('../controllers/membershipController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/tiers', getTiers);
router.post('/upgrade', protect, upgradeMembership);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllTiers);
router.put('/admin/hide-range', protect, adminOnly, hideMembershipsByRange);
router.put('/admin/unhide-range', protect, adminOnly, unhideMembershipsByRange);
router.put('/admin/set-restricted-range', protect, adminOnly, setRestrictedRange);
router.get('/admin/restricted-range', protect, adminOnly, getRestrictedRange);
router.delete('/admin/restricted-range', protect, adminOnly, clearRestrictedRange);

module.exports = router;
