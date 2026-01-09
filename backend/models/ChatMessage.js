const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Please provide message content']
    },
    readAt: Date
}, {
    timestamps: true
});

// Index for querying messages in a chat
chatMessageSchema.index({ chat: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
