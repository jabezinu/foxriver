const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            required: true
        }
    }],
    lastMessage: {
        content: String,
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for finding chats where user is a participant
chatSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Chat', chatSchema);
