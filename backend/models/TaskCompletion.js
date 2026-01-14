const mongoose = require('mongoose');

const taskCompletionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true
    },
    earningsAmount: {
        type: Number,
        required: true
    },
    watchedSeconds: {
        type: Number,
        default: 0
    },
    requiredWatchTime: {
        type: Number,
        default: 15
    }
}, {
    timestamps: true
});

// Ensure user can only complete a task once
taskCompletionSchema.index({ user: 1, task: 1 }, { unique: true });
taskCompletionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('TaskCompletion', taskCompletionSchema);
