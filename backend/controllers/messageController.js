const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get user's messages
// @route   GET /api/messages/user
// @access  Private
exports.getUserMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            'recipients.user': req.user.id
        })
            .populate('sender', 'phone role')
            .sort({ createdAt: -1 });

        // Format messages with read status for current user
        const formattedMessages = messages.map(msg => {
            const recipient = msg.recipients.find(r => r.user.toString() === req.user.id);
            return {
                ...msg.toObject(),
                isRead: recipient ? recipient.isRead : false,
                readAt: recipient ? recipient.readAt : null
            };
        });

        res.status(200).json({
            success: true,
            count: formattedMessages.length,
            messages: formattedMessages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Find recipient and update read status
        const recipient = message.recipients.find(r => r.user.toString() === req.user.id);

        if (!recipient) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        recipient.isRead = true;
        recipient.readAt = new Date();
        await message.save();

        res.status(200).json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Send message to users (admin)
// @route   POST /api/messages/send
// @access  Private/Admin
exports.sendMessage = async (req, res) => {
    try {
        const { title, content, userIds, isBroadcast } = req.body;

        let recipients = [];

        if (isBroadcast) {
            // Send to all users
            const allUsers = await User.find({ role: 'user' });
            recipients = allUsers.map(user => ({
                user: user._id,
                isRead: false
            }));
        } else if (userIds && userIds.length > 0) {
            // Send to specific users
            recipients = userIds.map(userId => ({
                user: userId,
                isRead: false
            }));
        } else {
            return res.status(400).json({
                success: false,
                message: 'Please specify recipients or set broadcast to true'
            });
        }

        const message = await Message.create({
            title,
            content,
            sender: req.user.id,
            recipients,
            isBroadcast
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message,
            recipientCount: recipients.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all messages (admin)
// @route   GET /api/messages/all
// @access  Private/Admin
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate('sender', 'phone role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
