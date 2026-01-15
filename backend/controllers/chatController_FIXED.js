const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Get or create chat between user and admin
// @route   GET /api/chat
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find existing chat between user and admin
        let chat = await Chat.findOne({
            where: {
                '$participants.user$': userId,
                isActive: true
            },
            include: [
                { model: User, as: 'participants', attributes: ['phone', 'role'] }
            ]
        });

        if (!chat) {
            // Get admin user
            const admin = await User.findOne({ where: { role: 'admin' } });
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            // Create new chat
            chat = await Chat.create({
                participants: [
                    { user: userId, role: 'user' },
                    { user: admin.id, role: 'admin' }
                ]
            });

            chat = await Chat.findByPk(chat.id, {
                include: [
                    { model: User, as: 'participants', attributes: ['phone', 'role'] }
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
        
        // Verify user is participant in chat
        const chat = await Chat.findOne({
            where: {
                id: chatId,
                '$participants.user$': req.user.id,
                isActive: true
            }
        });

        if (!chat) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }

        const messages = await ChatMessage.findAll({
            where: { chat: chatId },
            include: [
                { model: User, as: 'sender', attributes: ['phone', 'role'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Mark messages as read for user
        await ChatMessage.update(
            { readAt: new Date() },
            { 
                where: { 
                    chat: chatId, 
                    sender: { [Op.ne]: req.user.id },
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

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Verify user is participant in chat
        const chat = await Chat.findOne({
            where: {
                id: chatId,
                '$participants.user$': req.user.id,
                isActive: true
            }
        });

        if (!chat) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this chat'
            });
        }

        // Create message
        const message = await ChatMessage.create({
            chat: chatId,
            sender: req.user.id,
            content: content.trim()
        });

        // Update chat's last message
        await chat.update({
            lastMessage: {
                content: content.trim(),
                sender: req.user.id,
                timestamp: new Date()
            }
        });

        // Populate and return message
        const populatedMessage = await ChatMessage.findByPk(message.id, {
            include: [
                { model: User, as: 'sender', attributes: ['phone', 'role'] }
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
                { model: User, as: 'participants', attributes: ['phone', 'role'] }
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
