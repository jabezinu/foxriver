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
const { protect, adminOnly } = require('../middlewares/auth');

// User routes
router.get('/funds', protect, getWealthFunds);
router.get('/funds/:id', protect, getWealthFund);
router.post('/invest', protect, createInvestment);
router.get('/my-investments', protect, getMyInvestments);

// Admin routes
router.get('/admin/funds', protect, adminOnly, getAllWealthFunds);
router.post('/admin/funds', protect, adminOnly, createWealthFund);
router.put('/admin/funds/:id', protect, adminOnly, updateWealthFund);
router.delete('/admin/funds/:id', protect, adminOnly, deleteWealthFund);
router.get('/admin/investments', protect, adminOnly, getAllInvestments);

module.exports = router;
