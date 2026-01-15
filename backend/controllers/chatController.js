const { Chat, ChatMessage, User, sequelize } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// @desc    Get or create chat between user and admin
// @route   GET /api/chat
// @access  Private
exports.getChat = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    let chat = await Chat.findOne({
        where: { user: userId, isActive: true },
        include: [{ model: User, as: 'customer', attributes: ['phone', 'role', 'name'] }]
    });

    if (!chat) {
        chat = await Chat.create({
            user: userId,
            participants: [{ user: userId, role: 'user' }]
        });
        chat = await Chat.findByPk(chat.id, {
            include: [{ model: User, as: 'customer', attributes: ['phone', 'role', 'name'] }]
        });
    }

    res.status(200).json({ success: true, chat });
});

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
exports.getChatMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const chat = await Chat.findOne({ where: { id: chatId, isActive: true } });
    if (!chat) throw new AppError('Chat not found', 404);

    if (chat.user !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
        throw new AppError('Not authorized to view this chat', 403);
    }

    const messages = await ChatMessage.findAll({
        where: { chat: chatId },
        include: [{ model: User, as: 'senderDetails', attributes: ['phone', 'role', 'name'] }],
        order: [['createdAt', 'ASC']]
    });

    await ChatMessage.update(
        { readAt: new Date() },
        { where: { chat: chatId, sender: { [Op.ne]: userId }, readAt: null } }
    );

    res.status(200).json({ success: true, messages });
});

// @desc    Send message in chat
// @route   POST /api/chat/:chatId/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;
    const { id: userId, role: userRole } = req.user;

    if (!content?.trim()) throw new AppError('Message content is required', 400);

    const chat = await Chat.findOne({ where: { id: chatId, isActive: true } });
    if (!chat) throw new AppError('Chat not found', 404);

    if (chat.user !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
        throw new AppError('Not authorized to send messages', 403);
    }

    const message = await sequelize.transaction(async (t) => {
        const msg = await ChatMessage.create(
            { chat: chatId, sender: userId, content: content.trim() },
            { transaction: t }
        );
        await chat.update(
            { lastMessage: { content: content.trim(), sender: userId, timestamp: new Date() } },
            { transaction: t }
        );
        return msg;
    });

    const populatedMessage = await ChatMessage.findByPk(message.id, {
        include: [{ model: User, as: 'senderDetails', attributes: ['phone', 'role', 'name'] }]
    });

    res.status(201).json({ success: true, message: populatedMessage });
});

// @desc    Get all chats for admin
// @route   GET /api/chat/admin
// @access  Private/Admin
exports.getAllChats = asyncHandler(async (req, res) => {
    const chats = await Chat.findAll({
        where: { isActive: true },
        include: [{ model: User, as: 'customer', attributes: ['phone', 'role', 'name'] }],
        order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({ success: true, chats });
});
