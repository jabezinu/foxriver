const mongoose = require('mongoose');

const courseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide category name'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
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

// Index for querying active categories
courseCategorySchema.index({ status: 1, order: 1 });

module.exports = mongoose.model('CourseCategory', courseCategorySchema);
