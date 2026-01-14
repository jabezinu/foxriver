const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCoursesByCategory,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

// Public routes (for users)
router.get('/categories', protect, getCategories);
router.get('/category/:categoryId', protect, getCoursesByCategory);

// Admin routes
router.get('/admin/categories', protect, adminOnly, checkPermission('manage_courses'), getAllCategories);
router.post('/admin/categories', protect, adminOnly, checkPermission('manage_courses'), createCategory);
router.put('/admin/categories/:id', protect, adminOnly, checkPermission('manage_courses'), updateCategory);
router.delete('/admin/categories/:id', protect, adminOnly, checkPermission('manage_courses'), deleteCategory);

router.get('/admin/courses', protect, adminOnly, checkPermission('manage_courses'), getAllCourses);
router.post('/admin/courses', protect, adminOnly, checkPermission('manage_courses'), createCourse);
router.put('/admin/courses/:id', protect, adminOnly, checkPermission('manage_courses'), updateCourse);
router.delete('/admin/courses/:id', protect, adminOnly, checkPermission('manage_courses'), deleteCourse);

module.exports = router;
