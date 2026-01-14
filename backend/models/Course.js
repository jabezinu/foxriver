const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide course title'],
        trim: true
    },
    videoUrl: {
        type: String,
        required: [true, 'Please provide video URL'],
        trim: true
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'CourseCategory',
        required: [true, 'Please select a category']
    },
    order: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for querying courses by category and status
courseSchema.index({ category: 1, status: 1, order: 1 });

module.exports = mongoose.model('Course', courseSchema);
