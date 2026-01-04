const mongoose = require('mongoose');

const videoPoolSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
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

module.exports = mongoose.model('VideoPool', videoPoolSchema);
