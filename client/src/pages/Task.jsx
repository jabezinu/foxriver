import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Play, CheckCircle, Video, X, Clock } from 'lucide-react';
import ReactPlayer from 'react-player';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
        setCountdown(10); // Changed to 10 seconds for testing/UX
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
        <div className="animate-fade-in px-4 py-8 pb-24 bg-gray-50 min-h-screen">
            {/* Header Info */}
            <Card className="p-5 flex justify-between items-center bg-white border-0 shadow-lg shadow-indigo-500/5 mb-8">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Daily Potential</p>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{formatNumber(dailyStats.dailyIncome)} <span className="text-xs font-bold text-gray-400 uppercase align-top">ETB</span></h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Per Video</p>
                    <div className="inline-flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg text-emerald-700 font-bold border border-emerald-100">
                        <Video size={14} />
                        <span>{formatNumber(dailyStats.perVideoIncome)} ETB</span>
                    </div>
                </div>
            </Card>

            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide px-1">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Video size={16} />
                </div>
                Today's Tasks
            </h3>

            {/* Task List */}
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100 mx-1">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-gray-300" size={24} />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">No tasks available</p>
                        <p className="text-xs text-gray-300">Check back tomorrow for more</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <Card key={task._id} className="p-4 flex items-center gap-4 transition-all hover:shadow-md border-gray-100">
                            <div className="relative group">
                                <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-gray-100 text-gray-300' : 'bg-indigo-50 text-indigo-500'
                                    }`}>
                                    <Video size={32} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                </div>
                                {task.isCompleted && <div className="absolute inset-0 bg-white/50 rounded-2xl" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm leading-tight mb-2 truncate">{task.title}</p>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                    <span>+{formatNumber(task.earnings)} ETB</span>
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                {task.isCompleted ? (
                                    <div className="flex flex-col items-center gap-1 text-emerald-500">
                                        <CheckCircle size={28} fill="currentColor" className="text-emerald-100" />
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleViewVideo(task)}
                                        className="h-10 w-10 p-0 rounded-full flex items-center justify-center shadow-indigo-500/20 shadow-lg"
                                    >
                                        <Play size={18} fill="currentColor" className="ml-0.5" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Video Preview Overlay */}
            {activeVideo && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                    {/* Countdown Banner */}
                    <div className="absolute top-8 left-0 right-0 flex justify-center px-4 animate-slide-down">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-5 shadow-2xl">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center text-white font-bold text-xl relative z-10 bg-black/20">
                                    {countdown}
                                </div>
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 blur-sm animate-pulse-slow"></div>
                            </div>
                            <div>
                                <p className="text-white font-bold uppercase tracking-widest text-sm mb-0.5">Watching Ad</p>
                                <p className="text-indigo-200 text-xs font-medium">Reward: +{formatNumber(dailyStats.perVideoIncome)} ETB</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-8 ring-white/10 max-w-2xl relative">
                        {/* Loading/Buffering Indicator could go here */}
                        <ReactPlayer
                            url={activeVideo.url.startsWith('http') ? activeVideo.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeVideo.url}`}
                            controls={false}
                            width="100%"
                            height="100%"
                            playing={true}
                            muted={false}
                            config={{
                                file: {
                                    attributes: {
                                        style: { objectFit: 'cover', width: '100%', height: '100%' }
                                    }
                                }
                            }}
                        />
                    </div>

                    <button
                        onClick={() => {
                            setActiveVideo(null);
                            setCountdown(null);
                        }}
                        className="mt-12 flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors group"
                    >
                        <X size={16} className="group-hover:rotate-90 transition-transform" />
                        Cancel Task
                    </button>
                </div>
            )}
        </div>
    );
}
