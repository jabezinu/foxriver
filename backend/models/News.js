const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide news title']
    },
    content: {
        type: String,
        required: [true, 'Please provide news content']
    },
    imageUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    showAsPopup: {
        type: Boolean,
        default: false
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for querying active news
newsSchema.index({ status: 1, publishedDate: -1 });
newsSchema.index({ status: 1, showAsPopup: 1, publishedDate: -1 });

module.exports = mongoose.model('News', newsSchema);
