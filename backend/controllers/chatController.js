const { Chat, ChatMessage, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get or create chat between user and admin
// @route   GET /api/chat
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find existing chat for this user
        let chat = await Chat.findOne({
            where: {
                user: userId,
                isActive: true
            },
            include: [
                { model: User, as: 'customer', attributes: ['phone', 'role', 'name'] }
            ]
        });

        if (!chat) {
            // Create new chat for user
            chat = await Chat.create({
                user: userId,
                participants: [
                    { user: userId, role: 'user' }
                    // No need to explicitly add admin to participants array anymore if we use associations
                ]
            });

            // Re-fetch with include
            chat = await Chat.findByPk(chat.id, {
                include: [
                    { model: User, as: 'customer', attributes: ['phone', 'role', 'name'] }
                ]
            });
        }

        res.status(200).json({
            success: true,
            chat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verify user is participant in chat (admin or the chat owner)
        const chat = await Chat.findOne({
            where: {
                id: chatId,
                isActive: true
            }
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Only the chat owner or an admin can see the messages
        if (chat.user !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }

        const messages = await ChatMessage.findAll({
            where: { chat: chatId },
            include: [
                { model: User, as: 'senderDetails', attributes: ['phone', 'role', 'name'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Mark messages as read for user (if they are NOT the sender)
        await ChatMessage.update(
            { readAt: new Date() },
            {
                where: {
                    chat: chatId,
                    sender: { [Op.ne]: userId },
                    readAt: null
                }
            }
        );

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Send message in chat
// @route   POST /api/chat/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Verify chat exists and user is owner or admin
        const chat = await Chat.findOne({
            where: {
                id: chatId,
                isActive: true
            }
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        if (chat.user !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this chat'
            });
        }

        // Create message
        const message = await ChatMessage.create({
            chat: chatId,
            sender: userId,
            content: content.trim()
        });

        // Update chat's last message
        await chat.update({
            lastMessage: {
                content: content.trim(),
                sender: userId,
                timestamp: new Date()
            }
        });

        // Populate and return message
        const populatedMessage = await ChatMessage.findByPk(message.id, {
            include: [
                { model: User, as: 'senderDetails', attributes: ['phone', 'role', 'name'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all chats for admin
// @route   GET /api/chat/admin
// @access  Private/Admin
exports.getAllChats = async (req, res) => {
    try {
        const chats = await Chat.findAll({
            where: { isActive: true },
            include: [
                { model: User, as: 'customer', attributes: ['phone', 'role', 'name'] }
            ],
            order: [['updatedAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            chats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};