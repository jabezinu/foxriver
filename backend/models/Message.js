const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a message title']
    },
    content: {
        type: String,
        required: [true, 'Please provide message content']
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    recipients: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: Date
    }],
    isBroadcast: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for querying messages
messageSchema.index({ 'recipients.user': 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
