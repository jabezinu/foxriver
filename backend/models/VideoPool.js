const mongoose = require('mongoose');

const videoPoolSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: [true, 'Please provide video ID'],
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Please provide video title']
    },
    videoUrl: {
        type: String,
        required: [true, 'Please provide video URL']
    },
    playlist: {
        type: mongoose.Schema.ObjectId,
        ref: 'Playlist'
    },
    lastUsed: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for finding least recently used videos
videoPoolSchema.index({ lastUsed: 1 });
videoPoolSchema.index({ playlist: 1 });

module.exports = mongoose.model('VideoPool', videoPoolSchema);
