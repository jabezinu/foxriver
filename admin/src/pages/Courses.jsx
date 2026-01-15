import { useState, useEffect } from 'react';
import { HiVideoCamera, HiFolder, HiTrash, HiPencil, HiX, HiPlus } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { adminCoursesAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Courses() {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('categories');
    
    // Category form
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    
    // Course form
    const [courseForm, setCourseForm] = useState({ title: '', videoUrl: '', category: '' });
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [deleteCourseId, setDeleteCourseId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [categoriesRes, coursesRes] = await Promise.all([
                adminCoursesAPI.getCategories(),
                adminCoursesAPI.getCourses()
            ]);
            setCategories(categoriesRes.data.categories);
            setCourses(coursesRes.data.courses);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Category handlers
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCategoryId) {
                await adminCoursesAPI.updateCategory(editingCategoryId, categoryForm);
                toast.success('Category updated!');
            } else {
                await adminCoursesAPI.createCategory(categoryForm);
                toast.success('Category created!');
            }
            resetCategoryForm();
            fetchData();
            setShowCategoryForm(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCategory = (category) => {
        setCategoryForm({ name: category.name, description: category.description || '' });
        setEditingCategoryId(category.id);
        setShowCategoryForm(true);
    };

    const confirmDeleteCategory = async () => {
        try {
            await adminCoursesAPI.deleteCategory(deleteCategoryId);
            toast.success('Category deleted');
            fetchData();
        } catch (error) {
            toast.error('Deletion failed');
        } finally {
            setDeleteCategoryId(null);
        }
    };

    const resetCategoryForm = () => {
        setCategoryForm({ name: '', description: '' });
        setEditingCategoryId(null);
    };

    // Course handlers
    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCourseId) {
                await adminCoursesAPI.updateCourse(editingCourseId, courseForm);
                toast.success('Course updated!');
            } else {
                await adminCoursesAPI.createCourse(courseForm);
                toast.success('Course created!');
            }
            resetCourseForm();
            fetchData();
            setShowCourseForm(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCourse = (course) => {
        setCourseForm({ 
            title: course.title, 
            videoUrl: course.videoUrl,
            category: course.category
        });
        setEditingCourseId(course.id);
        setShowCourseForm(true);
    };

    const confirmDeleteCourse = async () => {
        try {
            await adminCoursesAPI.deleteCourse(deleteCourseId);
            toast.success('Course deleted');
            fetchData();
        } catch (error) {
            toast.error('Deletion failed');
        } finally {
            setDeleteCourseId(null);
        }
    };

    const resetCourseForm = () => {
        setCourseForm({ title: '', videoUrl: '', category: '' });
        setEditingCourseId(null);
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteCategoryId}
                onClose={() => setDeleteCategoryId(null)}
                onConfirm={confirmDeleteCategory}
                title="Delete Category"
                message="This will delete all courses in this category. Continue?"
                confirmText="Delete"
                isDangerous={true}
            />

            <ConfirmModal
                isOpen={!!deleteCourseId}
                onClose={() => setDeleteCourseId(null)}
                onConfirm={confirmDeleteCourse}
                title="Delete Course"
                message="Are you sure you want to delete this course?"
                confirmText="Delete"
                isDangerous={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
                    <p className="text-sm text-gray-500">Manage course categories and video courses.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                        activeTab === 'categories' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                    Categories
                </button>
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                        activeTab === 'courses' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                    Courses
                </button>
            </div>

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <>
                    <button
                        onClick={() => { setShowCategoryForm(true); resetCategoryForm(); }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mb-6"
                    >
                        <HiPlus />
                        Add Category
                    </button>

                    {showCategoryForm && (
                        <div className="admin-card mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
                                        <HiFolder />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                                        {editingCategoryId ? 'Edit Category' : 'New Category'}
                                    </h3>
                                </div>
                                <button onClick={() => { setShowCategoryForm(false); resetCategoryForm(); }} className="text-gray-400 hover:text-gray-600">
                                    <HiX className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                <input
                                    type="text" placeholder="Category Name" className="admin-input"
                                    value={categoryForm.name}
                                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Description (optional)" className="admin-input"
                                    value={categoryForm.description}
                                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    rows="3"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="submit" disabled={submitting}
                                        className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider"
                                    >
                                        {submitting ? 'Processing...' : (editingCategoryId ? 'Update' : 'Create')}
                                    </button>
                                    <button
                                        type="button" onClick={() => { setShowCategoryForm(false); resetCategoryForm(); }}
                                        className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">
                            Categories ({categories.length})
                        </h3>
                        {loading ? (
                            <div className="py-20 text-center text-gray-400">Loading...</div>
                        ) : (
                            <div className="space-y-3">
                                {categories.map((category) => (
                                    <div key={category.id} className="p-4 rounded-xl border bg-gray-50 hover:bg-white transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                                                    <HiFolder />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{category.name}</h4>
                                                    {category.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"
                                                >
                                                    <HiPencil />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteCategoryId(category.id)}
                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                                >
                                                    <HiTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="py-20 text-center text-gray-300">No categories found</div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <>
                    <button
                        onClick={() => { setShowCourseForm(true); resetCourseForm(); }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mb-6"
                        disabled={categories.length === 0}
                    >
                        <HiPlus />
                        Add Course
                    </button>

                    {categories.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800 text-sm">Please create at least one category first.</p>
                        </div>
                    )}

                    {showCourseForm && (
                        <div className="admin-card mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-500">
                                        <HiVideoCamera />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                                        {editingCourseId ? 'Edit Course' : 'New Course'}
                                    </h3>
                                </div>
                                <button onClick={() => { setShowCourseForm(false); resetCourseForm(); }} className="text-gray-400 hover:text-gray-600">
                                    <HiX className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleCourseSubmit} className="space-y-4">
                                <select
                                    className="admin-input"
                                    value={courseForm.category}
                                    onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text" placeholder="Course Title" className="admin-input"
                                    value={courseForm.title}
                                    onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                    required
                                />
                                <input
                                    type="url" placeholder="Video URL (YouTube, Vimeo, etc.)" className="admin-input"
                                    value={courseForm.videoUrl}
                                    onChange={e => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                                    required
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="submit" disabled={submitting}
                                        className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold uppercase tracking-wider"
                                    >
                                        {submitting ? 'Processing...' : (editingCourseId ? 'Update' : 'Create')}
                                    </button>
                                    <button
                                        type="button" onClick={() => { setShowCourseForm(false); resetCourseForm(); }}
                                        className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">
                            Courses ({courses.length})
                        </h3>
                        {loading ? (
                            <div className="py-20 text-center text-gray-400">Loading...</div>
                        ) : (
                            <div className="space-y-3">
                                {courses.map((course) => (
                                    <div key={course.id} className="p-4 rounded-xl border bg-gray-50 hover:bg-white transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-500">
                                                    <HiVideoCamera />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800">{course.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Category: {course.categoryDetails?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-blue-500 mt-1 truncate">{course.videoUrl}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditCourse(course)}
                                                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"
                                                >
                                                    <HiPencil />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteCourseId(course.id)}
                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                                >
                                                    <HiTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {courses.length === 0 && (
                                    <div className="py-20 text-center text-gray-300">No courses found</div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
