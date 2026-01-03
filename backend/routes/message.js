const express = require('express');
const router = express.Router();
const {
    getUserMessages,
    markAsRead,
    sendMessage,
    getAllMessages
} = require('../controllers/messageController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/user', protect, getUserMessages);
router.put('/:id/read', protect, markAsRead);
router.post('/send', protect, adminOnly, sendMessage);
router.get('/all', protect, adminOnly, getAllMessages);

module.exports = router;
