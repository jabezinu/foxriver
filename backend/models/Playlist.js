const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Please provide a YouTube playlist URL'],
        unique: true,
        trim: true
    },
    title: {
        type: String,
        default: 'Unnamed Playlist',
        trim: true
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

// Index for querying active playlists
playlistSchema.index({ status: 1 });

module.exports = mongoose.model('Playlist', playlistSchema);
