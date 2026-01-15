const { Message, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get user's messages
// @route   GET /api/messages/user
// @access  Private
exports.getUserMessages = asyncHandler(async (req, res) => {
    // Get messages where user is a recipient OR messages that are broadcast
    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { isBroadcast: true },
                sequelize.where(
                    sequelize.fn('JSON_SEARCH', sequelize.col('recipients'), 'one', req.user.id, null, '$[*].user'),
                    { [Op.ne]: null }
                )
            ]
        },
        include: [
            { model: User, as: 'senderDetails', attributes: ['phone', 'role'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Format messages with read status for current user
    const formattedMessages = messages.map(msg => {
        const msgObj = msg.toJSON();
        const recipient = Array.isArray(msgObj.recipients) ? msgObj.recipients.find(r => r.user === req.user.id) : null;
        return {
            ...msgObj,
            isRead: recipient ? recipient.isRead : false,
            readAt: recipient ? recipient.readAt : null
        };
    });

    res.status(200).json({ success: true, count: formattedMessages.length, messages: formattedMessages });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
    const message = await Message.findByPk(req.params.id);
    if (!message) throw new AppError('Message not found', 404);

    const recipients = Array.isArray(message.recipients) ? [...message.recipients] : [];
    let recipient = recipients.find(r => r.user === req.user.id);

    if (!recipient) {
        if (message.isBroadcast) {
            recipients.push({ user: req.user.id, isRead: true, readAt: new Date() });
        } else {
            throw new AppError('Not authorized', 403);
        }
    } else {
        recipient.isRead = true;
        recipient.readAt = new Date();
    }

    message.recipients = recipients;
    await message.save();

    res.status(200).json({ success: true, message: 'Message marked as read' });
});

// @desc    Send message to users (admin)
// @route   POST /api/messages/send
// @access  Private/Admin
exports.sendMessage = asyncHandler(async (req, res) => {
    const { title, content, userIds, isBroadcast } = req.body;
    let recipients = [];

    if (isBroadcast) {
        const allUsers = await User.findAll({ where: { role: 'user' }, attributes: ['id'] });
        recipients = allUsers.map(u => ({ user: u.id, isRead: false }));
    } else if (Array.isArray(userIds) && userIds.length > 0) {
        recipients = userIds.map(id => ({ user: id, isRead: false }));
    } else {
        throw new AppError('Specify recipients or set broadcast', 400);
    }

    const message = await Message.create({
        title, content, sender: req.user.id, recipients, isBroadcast
    });

    res.status(201).json({ success: true, message: 'Message sent', data: message, recipientCount: recipients.length });
});

// @desc    Get all messages (admin)
// @route   GET /api/messages/all
// @access  Private/Admin
exports.getAllMessages = asyncHandler(async (req, res) => {
    const messages = await Message.findAll({
        include: [{ model: User, as: 'senderDetails', attributes: ['phone', 'role'] }],
        order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: messages.length, messages });
});

// @desc    Update message (admin)
// @route   PUT /api/messages/:id
// @access  Private/Admin
exports.updateMessage = asyncHandler(async (req, res) => {
    const message = await Message.findByPk(req.params.id);
    if (!message) throw new AppError('Message not found', 404);

    await message.update(req.body);
    res.status(200).json({ success: true, message: 'Message updated', data: message });
});

// @desc    Delete message (admin)
// @route   DELETE /api/messages/:id
// @access  Private/Admin
exports.deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findByPk(req.params.id);
    if (!message) throw new AppError('Message not found', 404);

    await message.destroy();
    res.status(200).json({ success: true, message: 'Message deleted' });
});
