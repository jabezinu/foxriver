const express = require('express');
const router = express.Router();
const {
    getChat,
    getChatMessages,
    sendMessage,
    getAllChats
} = require('../controllers/chatController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

router.use(protect);

// User routes
router.get('/', getChat);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', sendMessage);

// Admin routes
router.get('/admin', adminOnly, checkPermission('manage_messages'), getAllChats);

module.exports = router;
