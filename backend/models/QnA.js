const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: [true, 'Please provide image URL or path']
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

module.exports = mongoose.model('QnA', qnaSchema);
