const Message = require('../models/Message');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Get user's messages
// @route   GET /api/messages/user
// @access  Private
exports.getUserMessages = async (req, res) => {
    try {
        // Get messages where user is a recipient OR messages that are broadcast
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { '$recipients.user$': req.user.id },
                    { isBroadcast: true }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['phone', 'role'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Format messages with read status for current user
        const formattedMessages = messages.map(msg => {
            const msgObj = msg.toJSON();
            const recipient = msgObj.recipients?.find(r => r.user === req.user.id);
            return {
                ...msgObj,
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
        const message = await Message.findByPk(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Find recipient and update read status
        const recipients = message.recipients || [];
        let recipient = recipients.find(r => r.user === req.user.id);

        if (!recipient) {
            // For broadcast messages, if user is not in recipients, add them
            if (message.isBroadcast) {
                recipients.push({
                    user: req.user.id,
                    isRead: true,
                    readAt: new Date()
                });
                message.recipients = recipients;
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }
        } else {
            recipient.isRead = true;
            recipient.readAt = new Date();
            message.recipients = recipients;
        }

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
            const allUsers = await User.findAll({ where: { role: 'user' } });
            recipients = allUsers.map(user => ({
                user: user.id,
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
        const messages = await Message.findAll({
            include: [
                { model: User, as: 'sender', attributes: ['phone', 'role'] }
            ],
            order: [['createdAt', 'DESC']]
        });

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

// @desc    Update message (admin)
// @route   PUT /api/messages/:id
// @access  Private/Admin
exports.updateMessage = async (req, res) => {
    try {
        const { title, content } = req.body;

        const message = await Message.findByPk(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.update({ title, content });

        res.status(200).json({
            success: true,
            message: 'Message updated successfully',
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete message (admin)
// @route   DELETE /api/messages/:id
// @access  Private/Admin
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.destroy();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
