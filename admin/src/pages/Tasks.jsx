import { useState, useEffect } from 'react';
import { adminTaskAPI } from '../services/api';
import { HiVideoCamera, HiPlus, HiTrash, HiPlay } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [dailySet, setDailySet] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await adminTaskAPI.getTasks();
            setTasks(res.data.tasks);
        } catch (error) {
            toast.error('Failed to load tasks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile && !youtubeUrl) {
            toast.error('Please provide a video file or YouTube URL');
            return;
        }
        if (!dailySet) {
            toast.error('Please select a mission date');
            return;
        }

        const formData = new FormData();
        if (videoFile) formData.append('video', videoFile);
        if (youtubeUrl) formData.append('youtubeUrl', youtubeUrl);
        formData.append('dailySet', dailySet);

        setUploading(true);
        try {
            await adminTaskAPI.upload(formData);
            toast.success('Task deployed successfully!');
            setVideoFile(null);
            setYoutubeUrl('');
            setDailySet('');
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await adminTaskAPI.delete(id);
            toast.success('Task deleted');
            fetchTasks();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Control</h1>
                    <p className="text-sm text-gray-500">Deploy daily video assignments with specific dates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deployment Form */}
                <div className="lg:col-span-1">
                    <div className="admin-card sticky top-8">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Deploy New Task</h3>
                        <form onSubmit={handleUpload} className="space-y-6">
                            {/* Mission Date */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Mission Date</label>
                                <input
                                    type="date"
                                    value={dailySet}
                                    onChange={(e) => setDailySet(e.target.value)}
                                    className="admin-input w-full"
                                    required
                                />
                            </div>

                            {/* YouTube URL */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">YouTube URL (Preferred)</label>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={youtubeUrl}
                                    onChange={(e) => {
                                        setYoutubeUrl(e.target.value);
                                        if (e.target.value) setVideoFile(null);
                                    }}
                                    className="admin-input w-full"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-400 font-bold">OR UPLOAD</span>
                                </div>
                            </div>

                            {/* Video Upload */}
                            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${videoFile ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-300'}`}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    id="video-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                        setVideoFile(e.target.files[0]);
                                        if (e.target.files[0]) setYoutubeUrl('');
                                    }}
                                />
                                <label htmlFor="video-upload" className="cursor-pointer">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${videoFile ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'}`}>
                                        <HiPlus className="text-2xl" />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-700 uppercase mb-1 truncate px-2">
                                        {videoFile ? videoFile.name : 'Select MP4 Video'}
                                    </p>
                                    {!videoFile && <p className="text-[10px] text-gray-400">Max size: 50MB</p>}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || (!videoFile && !youtubeUrl)}
                                className="admin-btn-primary w-full py-4 uppercase tracking-[0.2em] text-xs font-bold"
                            >
                                {uploading ? 'Processing...' : 'Deploy to Task Center'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Task List */}
                <div className="lg:col-span-2">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Current Deployed Tasks ({tasks.length})</h3>

                        {loading ? (
                            <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Scanning Network...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.map((task) => (
                                    <div key={task._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col group">
                                        <div className="aspect-video bg-gray-900 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
                                            {task.videoUrl && (task.videoUrl.includes('youtube.com') || task.videoUrl.includes('youtu.be')) ? (
                                                <iframe
                                                    className="w-full h-full"
                                                    src={`https://www.youtube.com/embed/${getYoutubeId(task.videoUrl)}`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <>
                                                    {task.videoUrl ? (
                                                        <video
                                                            className="w-full h-full object-cover opacity-50"
                                                            src={task.videoUrl.startsWith('http') ? task.videoUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${task.videoUrl}`}
                                                        />
                                                    ) : (
                                                        <div className="text-gray-500 text-[10px] font-bold uppercase">No Video Source</div>
                                                    )}
                                                    <HiPlay className="absolute text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                                </>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Mission Date</p>
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-full uppercase">
                                                        {new Date(task.dailySet).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-mono text-gray-800 font-bold">#{task._id.slice(-8)}</p>
                                                {task.uploadedBy && (
                                                    <p className="text-[9px] text-gray-400 font-medium">By: {task.uploadedBy.phone}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <HiTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No active tasks deployed</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
