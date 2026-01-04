const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: [true, 'Please provide video URL or path']
    },
    title: {
        type: String,
        default: 'Video Task'
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

// Index for querying tasks by status
taskSchema.index({ status: 1 });

module.exports = mongoose.model('Task', taskSchema);
