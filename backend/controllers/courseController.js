const Course = require('../models/Course');
const CourseCategory = require('../models/CourseCategory');

// @desc    Get all active categories
// @route   GET /api/courses/categories
// @access  Private
exports.getCategories = async (req, res) => {
    try {
        const categories = await CourseCategory.findAll({ 
            where: { status: 'active' },
            order: [['order', 'ASC']]
        });
        
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
        const courses = await Course.findAll({ 
            where: {
                category: req.params.categoryId,
                status: 'active'
            },
            order: [['order', 'ASC']]
        });
        
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
        const categories = await CourseCategory.findAll({ 
            order: [['order', 'ASC']]
        });
        
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
        const category = await CourseCategory.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await category.update(req.body);
        
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
        const category = await CourseCategory.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete all courses in this category
        await Course.destroy({ where: { category: req.params.id } });
        await category.destroy();
        
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
        const courses = await Course.findAll({
            include: [
                { model: CourseCategory, as: 'categoryDetails' }
            ],
            order: [['order', 'ASC']]
        });
        
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
        // Ensure category is an integer
        const courseData = {
            ...req.body,
            category: parseInt(req.body.category)
        };

        const course = await Course.create(courseData);
        const populatedCourse = await Course.findByPk(course.id, {
            include: [
                { model: CourseCategory, as: 'categoryDetails' }
            ]
        });
        
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course: populatedCourse
        });
    } catch (error) {
        console.error('Create course error:', error);
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
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Ensure category is an integer if provided
        const updateData = {
            ...req.body
        };
        if (updateData.category) {
            updateData.category = parseInt(updateData.category);
        }

        await course.update(updateData);

        const populatedCourse = await Course.findByPk(course.id, {
            include: [
                { model: CourseCategory, as: 'categoryDetails' }
            ]
        });
        
        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course: populatedCourse
        });
    } catch (error) {
        console.error('Update course error:', error);
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
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await course.destroy();
        
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
