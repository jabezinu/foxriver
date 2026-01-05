const express = require('express');
const router = express.Router();
const {
    getUserMessages,
    markAsRead,
    sendMessage,
    getAllMessages,
    updateMessage,
    deleteMessage
} = require('../controllers/messageController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/user', protect, getUserMessages);
router.put('/:id/read', protect, markAsRead);
router.post('/send', protect, adminOnly, sendMessage);
router.get('/all', protect, adminOnly, getAllMessages);
router.put('/:id', protect, adminOnly, updateMessage);
router.delete('/:id', protect, adminOnly, deleteMessage);

module.exports = router;
