const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    downlineUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    level: {
        type: String,
        enum: ['A', 'B', 'C'],
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        enum: [10, 5, 2]
    },
    amountEarned: {
        type: Number,
        required: true
    },
    sourceTask: {
        type: mongoose.Schema.ObjectId,
        ref: 'TaskCompletion',
        required: false
    },
    sourceMembership: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Index for querying commissions
commissionSchema.index({ user: 1, createdAt: -1 });
commissionSchema.index({ downlineUser: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
