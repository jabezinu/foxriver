const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    breakdown: {
        aLevel: Number,
        bLevel: Number,
        cLevel: Number,
        total: Number
    },
    ruleApplied: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for performance and uniqueness check helper
salarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
