const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    updateAdminProfile
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserDetails);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/profile', protect, adminOnly, updateAdminProfile);

module.exports = router;
