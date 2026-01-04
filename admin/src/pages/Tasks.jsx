import { useState, useEffect } from 'react';
import { adminTaskAPI } from '../services/api';
import { HiVideoCamera, HiPlus, HiTrash, HiPlay, HiRefresh, HiLink, HiCollection } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function TaskManagement() {
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'playlists'
    const [tasks, setTasks] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [videoCount, setVideoCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Manual Task Form
    const [videoFile, setVideoFile] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [dailySet, setDailySet] = useState('');

    // Playlist Form
    const [playlistUrl, setPlaylistUrl] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksRes, playlistsRes] = await Promise.all([
                adminTaskAPI.getTasks(),
                adminTaskAPI.getPlaylists()
            ]);
            setTasks(tasksRes.data.tasks);
            setPlaylists(playlistsRes.data.playlists);
            setVideoCount(playlistsRes.data.videoCount);
        } catch (error) {
            toast.error('Failed to load data');
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
        if (taskTitle) formData.append('title', taskTitle);
        formData.append('dailySet', dailySet);

        setUploading(true);
        try {
            await adminTaskAPI.upload(formData);
            toast.success('Task deployed successfully!');
            setVideoFile(null);
            setYoutubeUrl('');
            setTaskTitle('');
            setDailySet('');
            const res = await adminTaskAPI.getTasks();
            setTasks(res.data.tasks);
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
            const res = await adminTaskAPI.getTasks();
            setTasks(res.data.tasks);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleAddPlaylist = async (e) => {
        e.preventDefault();
        if (!playlistUrl) return;

        setUploading(true);
        try {
            await adminTaskAPI.addPlaylist({ url: playlistUrl });
            toast.success('Playlist added!');
            setPlaylistUrl('');
            const res = await adminTaskAPI.getPlaylists();
            setPlaylists(res.data.playlists);
            setVideoCount(res.data.videoCount);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add playlist');
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePlaylist = async (id) => {
        if (!window.confirm('Deleting a playlist will also remove its videos from the pool. Continue?')) return;
        try {
            await adminTaskAPI.deletePlaylist(id);
            toast.success('Playlist removed');
            const res = await adminTaskAPI.getPlaylists();
            setPlaylists(res.data.playlists);
            setVideoCount(res.data.videoCount);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await adminTaskAPI.syncVideos();
            toast.success(res.data.message);
            const playlistsRes = await adminTaskAPI.getPlaylists();
            setVideoCount(playlistsRes.data.videoCount);
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setSyncing(false);
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
                    <p className="text-sm text-gray-500">Manage daily video assignments and YouTube rotation pools.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Manual Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab('playlists')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'playlists' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Auto-Rotation Playlists
                    </button>
                </div>
            </div>

            {activeTab === 'manual' ? (
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

                                {/* Task Title */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Task Title (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Subscribe to Foxriver"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        className="admin-input w-full"
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
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Playlist Management Form */}
                    <div className="lg:col-span-1">
                        <div className="admin-card sticky top-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <HiLink className="text-xl" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Connect Playlist</h3>
                            </div>

                            <form onSubmit={handleAddPlaylist} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">YouTube Playlist URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://youtube.com/playlist?list=..."
                                        value={playlistUrl}
                                        onChange={(e) => setPlaylistUrl(e.target.value)}
                                        className="admin-input w-full"
                                        required
                                    />
                                    <p className="mt-2 text-[10px] text-gray-400 italic">Videos will be automatically extracted from this link and added to the pool.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || !playlistUrl}
                                    className="admin-btn-primary w-full py-4 uppercase tracking-[0.2em] text-xs font-bold"
                                >
                                    {uploading ? 'Connecting...' : 'Add to Rotation Pool'}
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Video Pool Size</p>
                                        <p className="text-2xl font-bold text-indigo-600">{videoCount} <span className="text-xs font-medium">Videos</span></p>
                                    </div>
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing || playlists.length === 0}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${syncing ? 'bg-indigo-200 text-white animate-spin' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200'}`}
                                        title="Sync All Playlists"
                                    >
                                        <HiRefresh className="text-xl" />
                                    </button>
                                </div>
                                <p className="mt-4 text-[10px] text-gray-400 text-center">
                                    Last sync: {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Playlist List */}
                    <div className="lg:col-span-2">
                        <div className="admin-card">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Active Playlists ({playlists.length})</h3>

                            {loading ? (
                                <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Scanning Pools...</div>
                            ) : (
                                <div className="space-y-4">
                                    {playlists.map((pl) => (
                                        <div key={pl._id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-500 shadow-sm">
                                                    <HiCollection className="text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800 mb-0.5">{pl.title}</p>
                                                    <p className="text-xs text-gray-500 font-mono truncate max-w-xs">{pl.url}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                    {pl.status}
                                                </span>
                                                <button
                                                    onClick={() => handleDeletePlaylist(pl._id)}
                                                    className="w-10 h-10 rounded-xl bg-white border border-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <HiTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {playlists.length === 0 && (
                                        <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                                            No playlists connected to rotation pool
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 p-6 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                                <h4 className="text-[10px] font-bold text-yellow-700 uppercase mb-2">How Rotation Works</h4>
                                <ul className="text-xs text-yellow-600 space-y-2 list-disc ml-4">
                                    <li>Connected playlists are automatically scanned for videos.</li>
                                    <li>Every 24 hours (or when current tasks expire), the system selects 5 random videos from the pool.</li>
                                    <li>Videos used today will not be repeated tomorrow (consecutive day filter).</li>
                                    <li>Manual tasks always take priority over auto-rotated tasks for a specific date.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
