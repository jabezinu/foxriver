const { Course, CourseCategory } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get all active categories
// @route   GET /api/courses/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await CourseCategory.findAll({
        where: { status: 'active' },
        order: [['order', 'ASC']]
    });
    res.status(200).json({ success: true, count: categories.length, categories });
});

// @desc    Get courses by category
// @route   GET /api/courses/category/:categoryId
// @access  Private
exports.getCoursesByCategory = asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        where: { category: req.params.categoryId, status: 'active' },
        order: [['order', 'ASC']]
    });
    res.status(200).json({ success: true, count: courses.length, courses });
});

// @desc    Get all categories (Admin)
// @route   GET /api/courses/admin/categories
// @access  Private/Admin
exports.getAllCategories = asyncHandler(async (req, res) => {
    const categories = await CourseCategory.findAll({ order: [['order', 'ASC']] });
    res.status(200).json({ success: true, count: categories.length, categories });
});

// @desc    Create category (Admin)
// @route   POST /api/courses/admin/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
    const category = await CourseCategory.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', category });
});

// @desc    Update category (Admin)
// @route   PUT /api/courses/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
    const category = await CourseCategory.findByPk(req.params.id);
    if (!category) throw new AppError('Category not found', 404);

    await category.update(req.body);
    res.status(200).json({ success: true, message: 'Category updated', category });
});

// @desc    Delete category (Admin)
// @route   DELETE /api/courses/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await CourseCategory.findByPk(req.params.id);
    if (!category) throw new AppError('Category not found', 404);

    // Delete all courses in this category
    await Course.destroy({ where: { category: req.params.id } });
    await category.destroy();

    res.status(200).json({ success: true, message: 'Category and courses deleted' });
});

// @desc    Get all courses (Admin)
// @route   GET /api/courses/admin/courses
// @access  Private/Admin
exports.getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: [{ model: CourseCategory, as: 'categoryDetails' }],
        order: [['order', 'ASC']]
    });
    res.status(200).json({ success: true, count: courses.length, courses });
});

// @desc    Create course (Admin)
// @route   POST /api/courses/admin/courses
// @access  Private/Admin
exports.createCourse = asyncHandler(async (req, res) => {
    const courseData = { ...req.body, category: parseInt(req.body.category) };
    const course = await Course.create(courseData);
    const populatedCourse = await Course.findByPk(course.id, {
        include: [{ model: CourseCategory, as: 'categoryDetails' }]
    });
    res.status(201).json({ success: true, message: 'Course created', course: populatedCourse });
});

// @desc    Update course (Admin)
// @route   PUT /api/courses/admin/courses/:id
// @access  Private/Admin
exports.updateCourse = asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) throw new AppError('Course not found', 404);

    const updateData = { ...req.body };
    if (updateData.category) updateData.category = parseInt(updateData.category);

    await course.update(updateData);
    const populatedCourse = await Course.findByPk(course.id, {
        include: [{ model: CourseCategory, as: 'categoryDetails' }]
    });
    res.status(200).json({ success: true, message: 'Course updated', course: populatedCourse });
});

// @desc    Delete course (Admin)
// @route   DELETE /api/courses/admin/courses/:id
// @access  Private/Admin
exports.deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) throw new AppError('Course not found', 404);

    await course.destroy();
    res.status(200).json({ success: true, message: 'Course deleted' });
});
