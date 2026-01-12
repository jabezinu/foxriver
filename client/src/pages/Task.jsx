import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Play, CheckCircle, Video, X, Clock, TrendingUp, Target } from 'lucide-react';
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
    const [earningsStats, setEarningsStats] = useState({ 
        todayEarnings: 0, 
        completedTasks: 0, 
        remainingTasks: 0,
        totalPossibleEarnings: 0 
    });
    const [internRestriction, setInternRestriction] = useState(null);
    const [isSunday, setIsSunday] = useState(false);

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
            setIsSunday(response.data.isSunday || false);
            setDailyStats({
                dailyIncome: response.data.dailyIncome,
                perVideoIncome: response.data.perVideoIncome
            });
            
            // Set intern restriction info
            setInternRestriction(response.data.internRestriction);
            
            // Use backend-calculated earnings statistics if available, otherwise calculate locally
            if (response.data.earningsStats) {
                setEarningsStats(response.data.earningsStats);
            } else {
                // Fallback to local calculation
                const completedTasks = response.data.tasks.filter(task => task.isCompleted).length;
                const remainingTasks = response.data.tasks.length - completedTasks;
                const todayEarnings = completedTasks * response.data.perVideoIncome;
                const totalPossibleEarnings = response.data.tasks.length * response.data.perVideoIncome;
                
                setEarningsStats({
                    todayEarnings,
                    completedTasks,
                    remainingTasks,
                    totalPossibleEarnings
                });
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewVideo = (task) => {
        if (task.isCompleted) return;
        
        // Check if Intern user can earn
        if (internRestriction && !internRestriction.canEarn) {
            toast.error('Your Intern trial period has ended. Please upgrade to Rank 1 to continue earning.');
            return;
        }
        
        setActiveVideo({ url: task.videoUrl, id: task._id });
        // Don't start countdown here - wait for video to actually start playing
        setCountdown(null);
    };

    const handleAutoResolve = async () => {
        if (isCompleting || !activeVideo) return;

        setIsCompleting(true);
        try {
            const response = await taskAPI.completeTask(activeVideo.id);
            if (response.data.success) {
                const newEarnings = earningsStats.todayEarnings + response.data.earningsAmount;
                toast.success(`Task completed! Earned ${formatNumber(response.data.earningsAmount)} ETB (Total today: ${formatNumber(newEarnings)} ETB)`);
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
        <div className="animate-fade-in px-4 py-8 pb-24 bg-zinc-950 min-h-screen">
            {/* Sunday Rest Day Banner */}
            {isSunday && (
                <Card className="p-4 mb-6 border-2 bg-blue-900/20 border-blue-600/50">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/20 text-blue-400">
                            <Clock size={16} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm mb-1 text-blue-300">
                                Sunday Rest Day
                            </h3>
                            <p className="text-xs text-zinc-300 mb-2">
                                Tasks are not available on Sundays. Enjoy your day off!
                            </p>
                            <p className="text-xs text-zinc-400">
                                Come back tomorrow to continue earning. Your progress is saved.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Intern Restriction Warning */}
            {internRestriction && (
                <Card className={`p-4 mb-6 border-2 ${
                    internRestriction.canEarn 
                        ? 'bg-amber-900/20 border-amber-600/50' 
                        : 'bg-red-900/20 border-red-600/50'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            internRestriction.canEarn 
                                ? 'bg-amber-500/20 text-amber-400' 
                                : 'bg-red-500/20 text-red-400'
                        }`}>
                            <Clock size={16} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-sm mb-1 ${
                                internRestriction.canEarn ? 'text-amber-300' : 'text-red-300'
                            }`}>
                                {internRestriction.canEarn ? 'Intern Trial Period' : 'Trial Period Ended'}
                            </h3>
                            <p className="text-xs text-zinc-300 mb-2">
                                {internRestriction.canEarn 
                                    ? `You have ${internRestriction.daysRemaining} day${internRestriction.daysRemaining !== 1 ? 's' : ''} remaining to earn from tasks as an Intern member.`
                                    : 'Your 4-day Intern trial period has ended. Task earning is no longer available.'
                                }
                            </p>
                            <p className="text-xs text-zinc-400">
                                {internRestriction.canEarn 
                                    ? 'Upgrade to Rank 1 before your trial ends to continue earning without interruption.'
                                    : 'Upgrade to Rank 1 membership to resume earning from tasks.'
                                }
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Header Info */}
            <Card className="p-5 flex justify-between items-center bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20 mb-8">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Daily Potential</p>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">{formatNumber(dailyStats.dailyIncome)} <span className="text-xs font-bold text-zinc-500 uppercase align-top">ETB</span></h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Per Video</p>
                    <div className="inline-flex items-center gap-1 bg-zinc-950/50 px-3 py-1.5 rounded-lg text-primary-500 font-bold border border-zinc-800">
                        <Video size={14} />
                        <span>{formatNumber(dailyStats.perVideoIncome)} ETB</span>
                    </div>
                </div>
            </Card>

            {/* Earnings Progress Card */}
            <Card className="p-5 bg-gradient-to-r from-emerald-900/20 to-primary-900/20 border-emerald-800/30 shadow-lg shadow-black/20 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp size={16} />
                        </div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide">Today's Progress</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-400 font-bold text-lg">{formatNumber(earningsStats.todayEarnings)} ETB</p>
                        <p className="text-xs text-zinc-500">of {formatNumber(earningsStats.totalPossibleEarnings)} ETB</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-emerald-400" />
                            <span className="text-zinc-300">{earningsStats.completedTasks} completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Target size={14} className="text-primary-400" />
                            <span className="text-zinc-300">{earningsStats.remainingTasks} remaining</span>
                        </div>
                    </div>
                    <div className="text-zinc-400 text-xs">
                        {tasks.length > 0 ? Math.round((earningsStats.completedTasks / tasks.length) * 100) : 0}% complete
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-primary-500 transition-all duration-500 ease-out"
                        style={{ 
                            width: tasks.length > 0 ? `${(earningsStats.completedTasks / tasks.length) * 100}%` : '0%' 
                        }}
                    ></div>
                </div>
            </Card>

            <h3 className="font-bold text-white mb-5 flex items-center gap-2 text-sm uppercase tracking-wide px-1">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
                    <Video size={16} />
                </div>
                Today's Tasks
            </h3>

            {/* Task List */}
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800 mx-1">
                        <div className="w-16 h-16 bg-zinc-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                            <Clock className="text-zinc-600" size={24} />
                        </div>
                        <p className="text-zinc-500 font-medium mb-1">No tasks available</p>
                        <p className="text-xs text-zinc-600">Check back tomorrow for more</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <Card key={task._id} className={`p-4 flex items-center gap-4 transition-all border-zinc-800 group ${
                            internRestriction && !internRestriction.canEarn 
                                ? 'bg-zinc-900/50 opacity-60' 
                                : 'hover:bg-zinc-800/80 bg-zinc-900'
                        }`}>
                            <div className="relative">
                                <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${
                                    task.isCompleted 
                                        ? 'bg-zinc-950 text-zinc-600 border border-zinc-800' 
                                        : internRestriction && !internRestriction.canEarn
                                            ? 'bg-zinc-950/50 text-zinc-700 border border-zinc-800'
                                            : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                                }`}>
                                    <Video size={32} strokeWidth={1.5} className={
                                        internRestriction && !internRestriction.canEarn 
                                            ? '' 
                                            : 'group-hover:scale-110 transition-transform'
                                    } />
                                </div>
                                {(task.isCompleted || (internRestriction && !internRestriction.canEarn)) && 
                                    <div className="absolute inset-0 bg-black/40 rounded-2xl" />
                                }
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm leading-tight mb-2 truncate transition-colors ${
                                    internRestriction && !internRestriction.canEarn 
                                        ? 'text-zinc-500' 
                                        : 'text-zinc-200 group-hover:text-primary-400'
                                }`}>
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                        internRestriction && !internRestriction.canEarn
                                            ? 'bg-zinc-950/50 text-zinc-600 border-zinc-800'
                                            : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                                    }`}>
                                        <span>
                                            {internRestriction && !internRestriction.canEarn 
                                                ? 'No Earnings' 
                                                : `+${formatNumber(task.earnings)} ETB`
                                            }
                                        </span>
                                    </div>
                                    {task.isCompleted && (
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-800/50">
                                            <CheckCircle size={8} />
                                            <span>Earned</span>
                                        </div>
                                    )}
                                    {internRestriction && !internRestriction.canEarn && (
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-900/30 text-red-400 text-[9px] font-bold uppercase tracking-wider border border-red-800/50">
                                            <X size={8} />
                                            <span>Disabled</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                {task.isCompleted ? (
                                    <div className="flex flex-col items-center gap-1 text-emerald-500">
                                        <CheckCircle size={28} fill="currentColor" className="text-zinc-950" />
                                    </div>
                                ) : internRestriction && !internRestriction.canEarn ? (
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-600 cursor-not-allowed">
                                        <X size={18} />
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleViewVideo(task)}
                                        className="h-10 w-10 p-0 rounded-full flex items-center justify-center shadow-glow border-none bg-primary-500 hover:bg-primary-600 text-black"
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
                <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-md">
                    <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 max-w-2xl relative">
                        {/* Countdown Overlay - Positioned over the video */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/70 backdrop-blur-sm border-2 border-primary-500 px-8 py-6 rounded-2xl flex items-center gap-6 shadow-2xl animate-pulse-slow">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary-500 flex items-center justify-center text-white font-bold text-3xl relative z-10 bg-black/50">
                                        {countdown || 8}
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-4 border-primary-500 blur-md animate-pulse"></div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold uppercase tracking-widest text-lg mb-1">Watching Ad</p>
                                    <p className="text-primary-400 text-sm font-medium">Reward: +{formatNumber(dailyStats.perVideoIncome)} ETB</p>
                                    <p className="text-zinc-300 text-xs mt-1">Total Today: {formatNumber(earningsStats.todayEarnings + dailyStats.perVideoIncome)} ETB</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Video Player */}
                        <ReactPlayer
                            url={activeVideo.url.startsWith('http') ? activeVideo.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeVideo.url}`}
                            controls={false}
                            width="100%"
                            height="100%"
                            playing={true}
                            muted={false}
                            onReady={() => {
                                // Video is ready but don't start countdown yet
                            }}
                            onStart={() => {
                                // Start countdown exactly when video starts playing
                                setCountdown(8);
                            }}
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
                        className="mt-12 flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors group"
                    >
                        <X size={16} className="group-hover:rotate-90 transition-transform" />
                        Cancel Task
                    </button>
                </div>
            )}
        </div>
    );
}
