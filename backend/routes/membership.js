const express = require('express');
const router = express.Router();
const { getTiers, upgradeMembership } = require('../controllers/membershipController');
const { protect } = require('../middlewares/auth');

router.get('/tiers', getTiers);
router.post('/upgrade', protect, upgradeMembership);

module.exports = router;
