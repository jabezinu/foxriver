const express = require('express');
const router = express.Router();
const {
    getWealthFunds,
    getWealthFund,
    createInvestment,
    getMyInvestments,
    getAllWealthFunds,
    createWealthFund,
    updateWealthFund,
    deleteWealthFund,
    getAllInvestments
} = require('../controllers/wealthController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

// User routes
router.get('/funds', protect, getWealthFunds);
router.get('/funds/:id', protect, getWealthFund);
router.post('/invest', protect, createInvestment);
router.get('/my-investments', protect, getMyInvestments);

// Admin routes
router.get('/admin/funds', protect, adminOnly, checkPermission('manage_wealth'), getAllWealthFunds);
router.post('/admin/funds', protect, adminOnly, checkPermission('manage_wealth'), createWealthFund);
router.put('/admin/funds/:id', protect, adminOnly, checkPermission('manage_wealth'), updateWealthFund);
router.delete('/admin/funds/:id', protect, adminOnly, checkPermission('manage_wealth'), deleteWealthFund);
router.get('/admin/investments', protect, adminOnly, checkPermission('manage_wealth'), getAllInvestments);

module.exports = router;
