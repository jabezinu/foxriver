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
    completionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure user can only complete a task once per day
taskCompletionSchema.index({ user: 1, task: 1 }, { unique: true });
taskCompletionSchema.index({ user: 1, completionDate: -1 });

module.exports = mongoose.model('TaskCompletion', taskCompletionSchema);
