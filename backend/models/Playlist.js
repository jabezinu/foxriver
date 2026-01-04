const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Please provide a YouTube playlist URL'],
        unique: true
    },
    title: {
        type: String,
        default: 'Unnamed Playlist'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Playlist', playlistSchema);
