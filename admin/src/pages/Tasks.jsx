import { useState, useEffect } from 'react';
import { adminTaskAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiVideoCamera, HiLink } from 'react-icons/hi';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/shared/PageHeader';
import ManualTaskForm from '../components/ManualTaskForm';
import TaskPool from '../components/TaskPool';
import PlaylistManager from '../components/PlaylistManager';

export default function TaskManagement() {
    const [activeTab, setActiveTab] = useState('manual');
    const [tasks, setTasks] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [videoCount, setVideoCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [deletePlaylistId, setDeletePlaylistId] = useState(null);

    // Forms
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [playlistUrl, setPlaylistUrl] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch POOL videos instead of active tasks
            const [tasksRes, playlistsRes] = await Promise.all([adminTaskAPI.getPool(), adminTaskAPI.getPlaylists()]);
            // Backend returns { videos: [...] } for getPool, need to check
            // My backend implementation for getPoolVideos returns { success: true, count: ..., videos: [...] }
            // API.js getPool calls /pool
            setTasks(tasksRes.data.videos || []);
            setPlaylists(playlistsRes.data.playlists);
            setVideoCount(playlistsRes.data.videoCount);
        } catch (error) {
            toast.error('Matrix Uplink Failed');
            console.error(error);
        } finally { setLoading(false); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            await adminTaskAPI.upload({ youtubeUrl, title: taskTitle });
            toast.success('Protocol Active');
            setYoutubeUrl(''); setTaskTitle('');
            const res = await adminTaskAPI.getPool(); // Refresh POOL
            setTasks(res.data.videos || []);
        } catch (error) { toast.error('Uplink Failed'); } finally { setUploading(false); }
    };

    const confirmDeleteTask = async () => {
        try {
            await adminTaskAPI.delete(deleteTaskId);
            toast.success('Unit Terminated');
            const res = await adminTaskAPI.getPool(); // Refresh POOL
            setTasks(res.data.videos || []);
        } catch (error) { toast.error('Termination Failed'); } finally { setDeleteTaskId(null); }
    };

    const handleAddPlaylist = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            await adminTaskAPI.addPlaylist({ url: playlistUrl });
            toast.success('Harvester Linked');
            setPlaylistUrl('');
            const res = await adminTaskAPI.getPlaylists();
            setPlaylists(res.data.playlists);
            setVideoCount(res.data.videoCount);
        } catch (error) { toast.error('Link Failed'); } finally { setUploading(false); }
    };

    const confirmDeletePlaylist = async () => {
        try {
            await adminTaskAPI.deletePlaylist(deletePlaylistId);
            toast.success('Node Severed');
            const res = await adminTaskAPI.getPlaylists();
            setPlaylists(res.data.playlists);
            setVideoCount(res.data.videoCount);
        } catch (error) { toast.error('Operation Failed'); } finally { setDeletePlaylistId(null); }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await adminTaskAPI.syncVideos();
            toast.success('Harvest Complete');
            const playlistsRes = await adminTaskAPI.getPlaylists();
            setVideoCount(playlistsRes.data.videoCount);
        } catch (error) { toast.error('Sync Lost'); } finally { setSyncing(false); }
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal isOpen={!!deleteTaskId} onClose={() => setDeleteTaskId(null)} onConfirm={confirmDeleteTask} title="Terminate Task" message="This unit will be permanently removed from the assignment matrix." isDangerous />
            <ConfirmModal isOpen={!!deletePlaylistId} onClose={() => setDeletePlaylistId(null)} onConfirm={confirmDeletePlaylist} title="Sever Node" message="Severing this harvester will also purge its harvested data. Continue?" isDangerous />

            <PageHeader
                title="Task Operations"
                subtitle="Assign daily protocols and manage auto-rotation resource pools."
            />

            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 max-w-sm border border-gray-200 shadow-sm">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <HiVideoCamera className="text-lg" /> Manual Signal
                </button>
                <button
                    onClick={() => setActiveTab('playlists')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === 'playlists' ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <HiLink className="text-lg" /> Rotation Pool
                </button>
            </div>

            {activeTab === 'manual' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <ManualTaskForm
                            title={taskTitle} setTitle={setTaskTitle}
                            url={youtubeUrl} setUrl={setYoutubeUrl}
                            onUpload={handleUpload} uploading={uploading}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <TaskPool
                            tasks={tasks} loading={loading}
                            onDelete={setDeleteTaskId} getYoutubeId={getYoutubeId}
                        />
                    </div>
                </div>
            ) : (
                <PlaylistManager
                    playlists={playlists} videoCount={videoCount}
                    url={playlistUrl} setUrl={setPlaylistUrl}
                    onAdd={handleAddPlaylist} onSync={handleSync}
                    onDelete={setDeletePlaylistId}
                    loading={loading} syncing={syncing} uploading={uploading}
                />
            )}
        </div>
    );
}
