import { useState, useEffect } from 'react';
import { taskAPI, userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiPlay, HiCheckCircle, HiVideoCamera } from 'react-icons/hi';
import ReactPlayer from 'react-player';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';

export default function Task() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyStats, setDailyStats] = useState({ dailyIncome: 0, perVideoIncome: 0 });
    const [activeVideo, setActiveVideo] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    // Timer logic
    useEffect(() => {
        let timer;
        if (countdown !== null && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && activeVideo) {
            handleAutoResolve();
        }
        return () => clearTimeout(timer);
    }, [countdown, activeVideo]);

    const fetchTasks = async () => {
        try {
            const response = await taskAPI.getDailyTasks();
            setTasks(response.data.tasks);
            setDailyStats({
                dailyIncome: response.data.dailyIncome,
                perVideoIncome: response.data.perVideoIncome
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewVideo = (task) => {
        if (task.isCompleted) return;
        setActiveVideo({ url: task.videoUrl, id: task._id });
        setCountdown(15);
    };

    const handleAutoResolve = async () => {
        if (isCompleting || !activeVideo) return;

        setIsCompleting(true);
        try {
            const response = await taskAPI.completeTask(activeVideo.id);
            if (response.data.success) {
                toast.success(`Task completed! Earned ${formatNumber(response.data.earningsAmount)} ETB`);
                setActiveVideo(null);
                setCountdown(null);
                fetchTasks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete task');
            setActiveVideo(null);
            setCountdown(null);
        } finally {
            setIsCompleting(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn px-4 py-6">
            {/* Header Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 flex justify-between items-center border border-gray-50">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Daily Potential</p>
                    <h2 className="text-2xl font-bold text-gray-900">{formatNumber(dailyStats.dailyIncome)} ETB</h2>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Per Video</p>
                    <p className="text-xl font-bold text-green-600">{formatNumber(dailyStats.perVideoIncome)} ETB</p>
                </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <HiVideoCamera className="text-green-500" />
                Daily Assigned Tasks
            </h3>

            {/* Task List */}
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">No tasks available for today yet.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task._id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center relative">
                                    <HiPlay className={`text-3xl ${task.isCompleted ? 'text-gray-300' : 'text-indigo-500'}`} />
                                </div>

                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-sm leading-tight mb-1">{task.title}</p>
                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Rewards: {formatNumber(task.earnings)} ETB</p>
                                </div>

                                <div>
                                    {task.isCompleted ? (
                                        <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] bg-green-50 px-3 py-2 rounded-xl uppercase">
                                            <HiCheckCircle className="text-sm" />
                                            Completed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleViewVideo(task)}
                                            className="bg-indigo-600 text-white font-bold text-[10px] px-5 py-2.5 rounded-xl uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
                                        >
                                            View
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Video Preview Overlay */}
            {activeVideo && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-4">
                    {/* Countdown Banner */}
                    <div className="absolute top-10 left-0 right-0 flex justify-center px-6">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                {countdown}
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold uppercase tracking-widest">Watching Video...</p>
                                <p className="text-white/60 text-[10px]">Earn {formatNumber(dailyStats.perVideoIncome)} ETB in few seconds</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                        <ReactPlayer
                            url={activeVideo.url.startsWith('http') ? activeVideo.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeVideo.url}`}
                            controls={false}
                            width="100%"
                            height="100%"
                            playing={true}
                            muted={false}
                        />
                    </div>

                    <button
                        onClick={() => {
                            setActiveVideo(null);
                            setCountdown(null);
                        }}
                        className="mt-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white transition-colors"
                    >
                        [ Skip & Exit ]
                    </button>
                </div>
            )}
        </div>
    );
}
