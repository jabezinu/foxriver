import { useState, useEffect } from 'react';
import { adminTaskAPI } from '../services/api';
import { HiVideoCamera, HiPlus, HiTrash, HiPlay, HiRefresh, HiLink, HiCollection } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import ConfirmModal from '../components/ConfirmModal';

export default function TaskManagement() {
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'playlists'
    const [tasks, setTasks] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [videoCount, setVideoCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [deletePlaylistId, setDeletePlaylistId] = useState(null);

    // Manual Task Form
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [taskTitle, setTaskTitle] = useState('');

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
        if (!youtubeUrl) {
            toast.error('Please provide a YouTube URL');
            return;
        }


        setUploading(true);
        try {
            await adminTaskAPI.upload({ youtubeUrl, title: taskTitle });
            toast.success('Task deployed successfully!');
            setYoutubeUrl('');
            setTaskTitle('');
            const res = await adminTaskAPI.getTasks();
            setTasks(res.data.tasks);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteTaskId(id);
    };

    const confirmDeleteTask = async () => {
        try {
            await adminTaskAPI.delete(deleteTaskId);
            toast.success('Task deleted');
            const res = await adminTaskAPI.getTasks();
            setTasks(res.data.tasks);
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteTaskId(null);
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

    const handleDeletePlaylist = (id) => {
        setDeletePlaylistId(id);
    };

    const confirmDeletePlaylist = async () => {
        try {
            await adminTaskAPI.deletePlaylist(deletePlaylistId);
            toast.success('Playlist removed');
            const res = await adminTaskAPI.getPlaylists();
            setPlaylists(res.data.playlists);
            setVideoCount(res.data.videoCount);
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeletePlaylistId(null);
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
            <ConfirmModal
                isOpen={!!deleteTaskId}
                onClose={() => setDeleteTaskId(null)}
                onConfirm={confirmDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task?"
                confirmText="Delete"
                isDangerous={true}
            />

            <ConfirmModal
                isOpen={!!deletePlaylistId}
                onClose={() => setDeletePlaylistId(null)}
                onConfirm={confirmDeletePlaylist}
                title="Remove Playlist"
                message="Deleting a playlist will also remove its videos from the pool. Continue?"
                confirmText="Remove Playlist"
                isDangerous={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Control</h1>
                    <p className="text-sm text-gray-500">Manage daily video assignments and YouTube rotation pools.</p>
                </div>
                <div className="flex flex-col sm:flex-row bg-gray-100 p-1 rounded-xl w-full md:w-auto">
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
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">YouTube URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        className="admin-input w-full"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || !youtubeUrl}
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
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <HiVideoCamera className="text-3xl text-gray-700" />
                                                        <div className="text-gray-500 text-[10px] font-bold uppercase text-center px-4">Internal Video Resource</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Created On</p>
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-full uppercase">
                                                            {new Date(task.createdAt).toLocaleDateString()}
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
                                        <div key={pl._id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
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
            )
            }
        </div >
    );
}
