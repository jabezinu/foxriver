const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: [true, 'Please provide image URL or path'],
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for querying active Q&A
qnaSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('QnA', qnaSchema);
