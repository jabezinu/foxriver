import { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiFolder, HiVideoCamera, HiArrowLeft } from 'react-icons/hi';
import Loading from '../components/Loading';
import ReactPlayer from 'react-player';
import logo from '../assets/logo.png';

export default function Courses() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await coursesAPI.getCategories();
            setCategories(res.data.categories);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setLoadingCourses(true);
        try {
            const res = await coursesAPI.getCoursesByCategory(category._id);
            setCourses(res.data.courses);
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleBack = () => {
        if (selectedCourse) {
            setSelectedCourse(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
            setCourses([]);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-5 py-4 flex items-center gap-3 sticky top-0 z-30 border-b border-zinc-800">
                {(selectedCategory || selectedCourse) && (
                    <button
                        onClick={handleBack}
                        className="p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-full transition-colors"
                    >
                        <HiArrowLeft size={20} />
                    </button>
                )}
                <h1 className="font-bold text-white text-lg">
                    {selectedCourse ? selectedCourse.title : selectedCategory ? selectedCategory.name : 'Courses'}
                </h1>
            </div>

            <div className="px-5 py-6">
                {/* Video Player View */}
                {selectedCourse && (
                    <div className="space-y-4">
                        <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                            <div className="aspect-video bg-black">
                                <ReactPlayer
                                    url={selectedCourse.videoUrl}
                                    width="100%"
                                    height="100%"
                                    controls
                                    playing
                                />
                            </div>
                        </div>
                        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                            <h2 className="font-bold text-white text-xl mb-2">{selectedCourse.title}</h2>
                            <p className="text-zinc-400 text-sm">Category: {selectedCategory?.name}</p>
                        </div>
                    </div>
                )}

                {/* Courses List View */}
                {!selectedCourse && selectedCategory && (
                    <div className="space-y-3">
                        {loadingCourses ? (
                            <div className="py-20 text-center">
                                <img 
                                    src={logo} 
                                    alt="Loading" 
                                    className="w-16 h-16 object-contain animate-pulse mx-auto"
                                />
                            </div>
                        ) : courses.length > 0 ? (
                            courses.map((course) => (
                                <div
                                    key={course._id}
                                    onClick={() => setSelectedCourse(course)}
                                    className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 hover:border-primary-500/30 transition-all cursor-pointer active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 border border-primary-500/20 shrink-0">
                                            <HiVideoCamera size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-sm mb-1">{course.title}</h3>
                                            <p className="text-xs text-zinc-400">Click to watch</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-zinc-400">No courses available in this category</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Categories Grid View */}
                {!selectedCategory && !selectedCourse && (
                    <div className="space-y-4">
                        <p className="text-zinc-400 text-sm">Select a category to view courses</p>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => (
                                <div
                                    key={category._id}
                                    onClick={() => handleCategoryClick(category)}
                                    className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 hover:border-primary-500/30 hover:shadow-glow transition-all cursor-pointer active:scale-95"
                                >
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 border border-primary-500/20">
                                            <HiFolder size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm mb-1">{category.name}</h3>
                                            {category.description && (
                                                <p className="text-xs text-zinc-400 line-clamp-2">{category.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-zinc-400">No categories available yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
