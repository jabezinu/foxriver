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
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

router.get('/user', protect, getUserMessages);
router.put('/:id/read', protect, markAsRead);
router.post('/send', protect, adminOnly, checkPermission('manage_messages'), sendMessage);
router.get('/all', protect, adminOnly, checkPermission('manage_messages'), getAllMessages);
router.put('/:id', protect, adminOnly, checkPermission('manage_messages'), updateMessage);
router.delete('/:id', protect, adminOnly, checkPermission('manage_messages'), deleteMessage);

module.exports = router;
