const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// @desc    Get or create chat between user and admin
// @route   GET /api/chat
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find existing chat between user and admin
        let chat = await Chat.findOne({
            'participants.user': userId,
            isActive: true
        }).populate('participants.user', 'phone role');

        if (!chat) {
            // Get admin user
            const admin = await User.findOne({ role: 'admin' });
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
                    { user: admin._id, role: 'admin' }
                ]
            });

            chat = await Chat.findById(chat._id).populate('participants.user', 'phone role');
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
            _id: chatId,
            'participants.user': req.user.id,
            isActive: true
        });

        if (!chat) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }

        const messages = await ChatMessage.find({ chat: chatId })
            .populate('sender', 'phone role')
            .sort({ createdAt: 1 });

        // Mark messages as read for user
        await ChatMessage.updateMany(
            { 
                chat: chatId, 
                sender: { $ne: req.user.id },
                readAt: null
            },
            { readAt: new Date() }
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
            _id: chatId,
            'participants.user': req.user.id,
            isActive: true
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
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: {
                content: content.trim(),
                sender: req.user.id,
                timestamp: new Date()
            }
        });

        // Populate and return message
        const populatedMessage = await ChatMessage.findById(message._id)
            .populate('sender', 'phone role');

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
        const chats = await Chat.find({ isActive: true })
            .populate('participants.user', 'phone role')
            .sort({ updatedAt: -1 });

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
