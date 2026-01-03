const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    getUserDetails
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserDetails);

module.exports = router;
