const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: [true, 'Please provide video URL or path']
    },
    dailySet: {
        type: Date,
        required: true
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

// Index for querying tasks by date and status
taskSchema.index({ dailySet: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
