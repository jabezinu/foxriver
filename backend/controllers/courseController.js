const Course = require('../models/Course');
const CourseCategory = require('../models/CourseCategory');

// @desc    Get all active categories
// @route   GET /api/courses/categories
// @access  Private
exports.getCategories = async (req, res) => {
    try {
        const categories = await CourseCategory.find({ status: 'active' }).sort({ order: 1 });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get courses by category
// @route   GET /api/courses/category/:categoryId
// @access  Private
exports.getCoursesByCategory = async (req, res) => {
    try {
        const courses = await Course.find({ 
            category: req.params.categoryId,
            status: 'active'
        }).sort({ order: 1 });
        
        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all categories (Admin)
// @route   GET /api/courses/admin/categories
// @access  Private/Admin
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await CourseCategory.find().sort({ order: 1 });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create category (Admin)
// @route   POST /api/courses/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const category = await CourseCategory.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update category (Admin)
// @route   PUT /api/courses/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const category = await CourseCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/courses/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await CourseCategory.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete all courses in this category
        await Course.deleteMany({ category: req.params.id });
        
        res.status(200).json({
            success: true,
            message: 'Category and associated courses deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all courses (Admin)
// @route   GET /api/courses/admin/courses
// @access  Private/Admin
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('category')
            .sort({ order: 1 });
        
        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create course (Admin)
// @route   POST /api/courses/admin/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        const populatedCourse = await Course.findById(course._id).populate('category');
        
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course: populatedCourse
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update course (Admin)
// @route   PUT /api/courses/admin/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete course (Admin)
// @route   DELETE /api/courses/admin/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
