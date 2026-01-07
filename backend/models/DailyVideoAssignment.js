const mongoose = require('mongoose');

const dailyVideoAssignmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    assignmentDate: {
        type: Date,
        required: true
    },
    videos: [{
        video: {
            type: mongoose.Schema.ObjectId,
            ref: 'VideoPool',
            required: true
        },
        watchedSeconds: {
            type: Number,
            default: 0
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        },
        rewardAmount: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
});

// Ensure one assignment per user per day
dailyVideoAssignmentSchema.index({ user: 1, assignmentDate: 1 }, { unique: true });

// Index for querying by date
dailyVideoAssignmentSchema.index({ assignmentDate: 1 });

module.exports = mongoose.model('DailyVideoAssignment', dailyVideoAssignmentSchema);