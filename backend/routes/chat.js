const express = require('express');
const router = express.Router();
const {
    getChat,
    getChatMessages,
    sendMessage,
    getAllChats
} = require('../controllers/chatController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect);

// User routes
router
    .route('/')
    .get(getChat);

router
    .route('/:chatId/messages')
    .get(getChatMessages)
    .post(sendMessage);

// Admin routes
router
    .route('/admin')
    .get(adminOnly, getAllChats);

module.exports = router;
