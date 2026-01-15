import { useState, useEffect } from 'react';
import { adminCoursesAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiPlus, HiRefresh, HiFolder, HiVideoCamera } from 'react-icons/hi';
import PageHeader from '../components/shared/PageHeader';
import CourseCategoryCard from '../components/CourseCategoryCard';
import CourseItem from '../components/CourseItem';
import { CategoryModal, CourseModal } from '../components/CourseManagementModals';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';

export default function Courses() {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('categories');

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);

    const [courseForm, setCourseForm] = useState({ title: '', videoUrl: '', category: '' });
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [deleteCourseId, setDeleteCourseId] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [categoriesRes, coursesRes] = await Promise.all([
                adminCoursesAPI.getCategories(),
                adminCoursesAPI.getCourses()
            ]);
            setCategories(categoriesRes.data.categories);
            setCourses(coursesRes.data.courses);
        } catch (error) { toast.error('Registry Sync Failed'); }
        finally { setLoading(false); }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCategoryId) {
                await adminCoursesAPI.updateCategory(editingCategoryId, categoryForm);
                toast.success('Category Registry Updated');
            } else {
                await adminCoursesAPI.createCategory(categoryForm);
                toast.success('New Category Node Initialized');
            }
            setShowCategoryForm(false);
            fetchData();
        } catch (error) { toast.error('Command Execution Aborted'); }
        finally { setSubmitting(false); }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCourseId) {
                await adminCoursesAPI.updateCourse(editingCourseId, courseForm);
                toast.success('Course Payload Re-synchronized');
            } else {
                await adminCoursesAPI.createCourse(courseForm);
                toast.success('Course Protocol Deployed');
            }
            setShowCourseForm(false);
            fetchData();
        } catch (error) { toast.error('Transmission Blocked'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn space-y-8">
            <ConfirmModal
                isOpen={!!deleteCategoryId} onClose={() => setDeleteCategoryId(null)}
                onConfirm={async () => {
                    await adminCoursesAPI.deleteCategory(deleteCategoryId);
                    toast.success('Category Purged');
                    fetchData();
                    setDeleteCategoryId(null);
                }}
                title="Decommission Category Node" message="This will permanently sever all courses associated with this classification. Purge proceed?" confirmText="Purge Node" isDangerous={true}
            />

            <ConfirmModal
                isOpen={!!deleteCourseId} onClose={() => setDeleteCourseId(null)}
                onConfirm={async () => {
                    await adminCoursesAPI.deleteCourse(deleteCourseId);
                    toast.success('Course Terminal Removed');
                    fetchData();
                    setDeleteCourseId(null);
                }}
                title="Decomission Course Terminal" message="Are you certain you wish to terminate this visual education link?" confirmText="Sever Link" isDangerous={true}
            />

            <PageHeader
                title="Academic Matrix Oversight"
                subtitle="Manage classification nodes and visual education payloads deployed to network personnel."
                extra={
                    <button onClick={fetchData} className="admin-btn-secondary flex items-center gap-2">
                        <HiRefresh /> Global Sync
                    </button>
                }
            />

            {/* Premium Selector */}
            <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit border border-gray-200 shadow-inner">
                <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<HiFolder />} label="Classification Nodes" />
                <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<HiVideoCamera />} label="Visual Payloads" />
            </div>

            {activeTab === 'categories' ? (
                <div className="space-y-8 animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em] mb-1">Node Registry</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{categories.length} Verified classification nodes active</p>
                        </div>
                        <button onClick={() => { setCategoryForm({ name: '', description: '' }); setEditingCategoryId(null); setShowCategoryForm(true); }} className="admin-btn-primary flex items-center gap-2 h-fit">
                            <HiPlus /> New Node
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map(cat => <CourseCategoryCard key={cat.id} category={cat} onEdit={c => { setCategoryForm({ name: c.name, description: c.description }); setEditingCategoryId(c.id); setShowCategoryForm(true); }} onDelete={setDeleteCategoryId} />)}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em] mb-1">Payload Registry</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{courses.length} Visual education payloads in orbit</p>
                        </div>
                        <button disabled={categories.length === 0} onClick={() => { setCourseForm({ title: '', videoUrl: '', category: '' }); setEditingCourseId(null); setShowCourseForm(true); }} className="admin-btn-primary flex items-center gap-2 h-fit disabled:opacity-30 disabled:cursor-not-allowed">
                            <HiPlus /> Deploy Payload
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {courses.map(course => <CourseItem key={course.id} course={course} onEdit={c => { setCourseForm({ title: c.title, videoUrl: c.videoUrl, category: c.category }); setEditingCourseId(c.id); setShowCourseForm(true); }} onDelete={setDeleteCourseId} />)}
                    </div>
                </div>
            )}

            <CategoryModal isOpen={showCategoryForm} onClose={() => setShowCategoryForm(false)} editingId={editingCategoryId} formData={categoryForm} onChange={setCategoryForm} onSubmit={handleCategorySubmit} submitting={submitting} />
            <CourseModal isOpen={showCourseForm} onClose={() => setShowCourseForm(false)} editingId={editingCourseId} formData={courseForm} onChange={setCourseForm} onSubmit={handleCourseSubmit} submitting={submitting} categories={categories} />
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-white text-indigo-600 shadow-md shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-base">{icon}</span> {label}
        </button>
    );
}
