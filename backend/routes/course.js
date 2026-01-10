const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const CourseCategory = require('../models/CourseCategory');
const { protect, adminOnly } = require('../middlewares/auth');

// Public routes (for users)
router.get('/categories', protect, async (req, res) => {
    try {
        const categories = await CourseCategory.find({ status: 'active' }).sort({ order: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/category/:categoryId', protect, async (req, res) => {
    try {
        const courses = await Course.find({ 
            category: req.params.categoryId,
            status: 'active'
        }).sort({ order: 1 });
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin routes
router.get('/admin/categories', protect, adminOnly, async (req, res) => {
    try {
        const categories = await CourseCategory.find().sort({ order: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/admin/categories', protect, adminOnly, async (req, res) => {
    try {
        const category = await CourseCategory.create(req.body);
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/admin/categories/:id', protect, adminOnly, async (req, res) => {
    try {
        const category = await CourseCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/admin/categories/:id', protect, adminOnly, async (req, res) => {
    try {
        await Course.deleteMany({ category: req.params.id });
        await CourseCategory.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/admin/courses', protect, adminOnly, async (req, res) => {
    try {
        const courses = await Course.find().populate('category').sort({ order: 1 });
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/admin/courses', protect, adminOnly, async (req, res) => {
    try {
        const course = await Course.create(req.body);
        const populatedCourse = await Course.findById(course._id).populate('category');
        res.json({ success: true, course: populatedCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/admin/courses/:id', protect, adminOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('category');
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/admin/courses/:id', protect, adminOnly, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
