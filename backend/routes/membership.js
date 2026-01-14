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
    clearRestrictedRange,
    updateMembershipPrice,
    bulkUpdatePrices
} = require('../controllers/membershipController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

router.get('/tiers', getTiers);
router.post('/upgrade', protect, upgradeMembership);

// Admin routes
router.get('/admin/all', protect, adminOnly, checkPermission('manage_membership'), getAllTiers);
router.put('/admin/hide-range', protect, adminOnly, checkPermission('manage_membership'), hideMembershipsByRange);
router.put('/admin/unhide-range', protect, adminOnly, checkPermission('manage_membership'), unhideMembershipsByRange);
router.put('/admin/set-restricted-range', protect, adminOnly, checkPermission('manage_membership'), setRestrictedRange);
router.get('/admin/restricted-range', protect, adminOnly, checkPermission('manage_membership'), getRestrictedRange);
router.delete('/admin/restricted-range', protect, adminOnly, checkPermission('manage_membership'), clearRestrictedRange);
router.put('/admin/update-price/:id', protect, adminOnly, checkPermission('manage_membership'), updateMembershipPrice);
router.put('/admin/bulk-update-prices', protect, adminOnly, checkPermission('manage_membership'), bulkUpdatePrices);

module.exports = router;
