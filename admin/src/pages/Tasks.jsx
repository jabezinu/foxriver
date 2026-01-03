import { useState, useEffect } from 'react';
import { adminTaskAPI } from '../services/api';
import { HiVideoCamera, HiPlus, HiTrash, HiPlay } from 'react-icons/hi';

export default function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [videoFile, setVideoFile] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await adminTaskAPI.getTasks();
            setTasks(res.data.tasks);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile) return;

        const formData = new FormData();
        formData.append('video', videoFile);

        setUploading(true);
        try {
            await adminTaskAPI.upload(formData);
            alert('Video task uploaded successfully!');
            setVideoFile(null);
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this video task?')) return;
        try {
            await adminTaskAPI.delete(id);
            fetchTasks();
        } catch (error) {
            alert('Delete failed');
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Control</h1>
                    <p className="text-sm text-gray-500">Deploy daily video assignments to the user network.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="admin-card sticky top-8">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Deploy New Video</h3>
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center hover:border-indigo-300 transition-all">
                                <input
                                    type="file"
                                    accept="video/*"
                                    id="video-upload"
                                    className="hidden"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                />
                                <label htmlFor="video-upload" className="cursor-pointer">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                        <HiPlus className="text-3xl" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-700 uppercase mb-1">
                                        {videoFile ? videoFile.name : 'Select MP4 Video'}
                                    </p>
                                    <p className="text-[10px] text-gray-400">Max size: 50MB</p>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !videoFile}
                                className="admin-btn-primary w-full py-4 uppercase tracking-[0.2em] text-xs font-bold"
                            >
                                {uploading ? 'Processing Data...' : 'Deploy to Task Center'}
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
                                            <video
                                                className="w-full h-full object-cover opacity-50"
                                                src={task.videoUrl.startsWith('http') ? task.videoUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${task.videoUrl}`}
                                            />
                                            <HiPlay className="absolute text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Task Identity</p>
                                                <p className="text-xs font-mono text-gray-800 font-bold">#{task._id.slice(-8)}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
