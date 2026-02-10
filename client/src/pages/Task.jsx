import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Play, CheckCircle, Video, X, Clock, TrendingUp, Target } from 'lucide-react';
import ReactPlayer from 'react-player';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/ui/Card';
import { getServerUrl } from '../config/api.config';

import { useUserStore } from '../store/userStore';

export default function Task() {
    // Use store data
    const {
        tasks,
        fetchTasks,
        dailyStats,
        internRestriction,
        isSunday,
        earningsStats: storeEarningsStats,
        loading: { tasks: loading } // Map store loading.tasks to local loading
    } = useUserStore();

    const [activeVideo, setActiveVideo] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [isCompleting, setIsCompleting] = useState(false);

    // Derived or local earnings stats if not provided by backend
    // The store has earningsStats, but if it is null, we calculate locally.
    // We can use a derived state here.
    const earningsStats = storeEarningsStats || (() => {
        const completedTasks = tasks.filter(task => task.isCompleted).length;
        const remainingTasks = tasks.length - completedTasks;
        const todayEarnings = completedTasks * dailyStats.perVideoIncome;
        const totalPossibleEarnings = tasks.length * dailyStats.perVideoIncome;

        return {
            todayEarnings,
            completedTasks,
            remainingTasks,
            totalPossibleEarnings
        };
    })();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

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
        const completedTaskId = activeVideo.id; // Capture the ID before clearing state
        
        try {
            const response = await taskAPI.completeTask(completedTaskId);
            if (response.data.success) {
                const newEarnings = earningsStats.todayEarnings + response.data.earningsAmount;
                toast.success(`Task completed! Earned ${formatNumber(response.data.earningsAmount)} ETB (Total today: ${formatNumber(newEarnings)} ETB)`);

                // Close video and redirect back to tasks
                setActiveVideo(null);
                setCountdown(null);

                // Update local task state instead of full refetch
                // This avoids unnecessary API call and provides instant feedback
                useUserStore.setState(state => ({
                    tasks: state.tasks.map(t => 
                        t._id === completedTaskId 
                            ? { ...t, isCompleted: true }
                            : t
                    ),
                    lastTasksFetch: Date.now() // Reset cache timer
                }));
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
                <Card className={`p-4 mb-6 border-2 ${internRestriction.canEarn
                    ? 'bg-amber-900/20 border-amber-600/50'
                    : 'bg-red-900/20 border-red-600/50'
                    }`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${internRestriction.canEarn
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            <Clock size={16} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-sm mb-1 ${internRestriction.canEarn ? 'text-amber-300' : 'text-red-300'
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
            {/* <Card className="p-5 flex justify-between items-center bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20 mb-8">
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
            </Card> */}

            {/* Earnings Progress Card */}
            <Card className="p-6 bg-zinc-900 border-2 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.2)] mb-8 relative overflow-hidden rounded-[2.5rem]">
                <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center border-2 border-yellow-500/20 shadow-lg">
                            <TrendingUp size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="font-black text-white text-base uppercase tracking-tighter">Today's Progress</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-yellow-400 font-black text-2xl drop-shadow-md">{formatNumber(earningsStats.todayEarnings)} ETB</p>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight">of {formatNumber(earningsStats.totalPossibleEarnings)} ETB</p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={16} className="text-emerald-400" strokeWidth={2.5} />
                            <span className="text-zinc-300 font-bold">{earningsStats.completedTasks} completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Target size={16} className="text-yellow-500" strokeWidth={2.5} />
                            <span className="text-zinc-300 font-bold">{earningsStats.remainingTasks} remaining</span>
                        </div>
                    </div>
                    <div className="text-white font-black text-sm">
                        {tasks.length > 0 ? Math.round((earningsStats.completedTasks / tasks.length) * 100) : 0}%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-zinc-700 relative z-10">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                        style={{
                            width: tasks.length > 0 ? `${(earningsStats.completedTasks / tasks.length) * 100}%` : '0%'
                        }}
                    ></div>
                </div>
            </Card>

            <h3 className="font-black text-white mb-6 flex items-center gap-3 text-base uppercase tracking-widest px-1">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/20">
                    <Video size={20} strokeWidth={3} />
                </div>
                Active Missions
            </h3>

            {/* Task List */}
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-800 rounded-3xl border-2 border-dashed border-zinc-700 mx-1">
                        <div className="w-16 h-16 bg-zinc-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                            <Clock className="text-zinc-600" size={24} />
                        </div>
                        <p className="text-zinc-500 font-medium mb-1">No tasks available</p>
                        <p className="text-xs text-zinc-600">Check back tomorrow for more</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div 
                            key={task._id} 
                            onClick={!task.isCompleted && (!internRestriction || internRestriction.canEarn) ? () => handleViewVideo(task) : undefined}
                            className={`
                                group relative p-[2.5px] rounded-[2rem] overflow-hidden transition-all duration-500 mb-6
                                ${!task.isCompleted && (!internRestriction || internRestriction.canEarn) 
                                    ? 'hover:shadow-[0_25px_60px_rgba(234,179,8,0.5)] cursor-pointer active:scale-[0.98]' 
                                    : 'opacity-90 shadow-2xl'}
                            `}
                        >
                            {/* Animated Spinning Border */}
                            {!task.isCompleted && (!internRestriction || internRestriction.canEarn) && (
                                <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_25%,#fbbf24_50%,transparent_75%)] animate-spin-slow opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                            )}

                            {/* Main Card Fill (Electric Glass) */}
                            <div className={`
                                relative z-10 flex items-center gap-5 p-6 rounded-[calc(2rem-2px)] h-full transition-all duration-500 overflow-hidden
                                ${task.isCompleted 
                                    ? 'bg-zinc-900/80 border border-zinc-800 opacity-70' 
                                    : internRestriction && !internRestriction.canEarn
                                        ? 'bg-zinc-800/60 border border-zinc-700 opacity-50'
                                        : 'bg-orange-500/[0.08] backdrop-blur-2xl border-2 border-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.15)] group-hover:bg-orange-500/15'}
                            `}>
                                {/* Supercharged Orange Illumination */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/40 via-orange-400/5 to-transparent pointer-events-none opacity-100"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

                                <div className="relative z-20">
                                    <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${task.isCompleted
                                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                        : internRestriction && !internRestriction.canEarn
                                            ? 'bg-zinc-800/50 text-zinc-700 border border-zinc-700'
                                            : 'bg-yellow-500 text-zinc-950 border-2 border-white/30 shadow-[0_0_20px_rgba(234,179,8,0.5)]'
                                        }`}>
                                        <Video size={36} strokeWidth={3} className={
                                            internRestriction && !internRestriction.canEarn
                                                ? ''
                                                : 'group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-xl'
                                        } />
                                    </div>
                                    {task.isCompleted && (
                                        <div className="absolute -top-3 -right-3 bg-emerald-500 text-zinc-950 rounded-full p-1.5 shadow-2xl border-4 border-zinc-900">
                                            <CheckCircle size={18} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 relative z-20">
                                    <p className={`font-black text-xl leading-tight mb-1 truncate transition-colors ${internRestriction && !internRestriction.canEarn
                                        ? 'text-zinc-500'
                                        : task.isCompleted ? 'text-zinc-400' : 'text-white'
                                        }`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[12px] font-black uppercase tracking-wider border-2 ${internRestriction && !internRestriction.canEarn
                                            ? 'bg-zinc-900/50 text-zinc-600 border-zinc-800'
                                            : task.isCompleted ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                            }`}>
                                            <span className="text-zinc-500 uppercase text-[10px]">Income:</span>
                                            <span className="text-yellow-400">
                                                {internRestriction && !internRestriction.canEarn
                                                    ? 'Locked'
                                                    : `+${formatNumber(task.earnings)} ETB`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 relative z-20">
                                    {task.isCompleted ? (
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30">
                                            <CheckCircle size={28} strokeWidth={3} />
                                        </div>
                                    ) : internRestriction && !internRestriction.canEarn ? (
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-600 border border-zinc-700 opacity-50">
                                            <X size={24} strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-zinc-950 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:bg-black border-4 border-white/20">
                                            <Play size={28} fill="currentColor" strokeWidth={0} className="ml-1.5" />
                                        </div>
                                    )}
                                </div>

                                {/* Animated Shine Overlay */}
                                {!task.isCompleted && (!internRestriction || internRestriction.canEarn) && (
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-[2rem] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-20 translate-x-[-250%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Video Preview Overlay */}
            {activeVideo && (
                <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-full h-full relative flex flex-col">
                        {/* Countdown Timer - At the top */}
                        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-4">
                            <div className="flex items-center justify-between max-w-2xl mx-auto">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border-3 border-primary-500 flex items-center justify-center text-white font-bold text-xl bg-black/50">
                                            {countdown || 8}
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-3 border-primary-500 blur-sm animate-pulse"></div>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Watching Ad</p>
                                        <p className="text-primary-400 text-xs">+{formatNumber(dailyStats.perVideoIncome)} ETB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setActiveVideo(null);
                                        setCountdown(null);
                                    }}
                                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/50 px-3 py-2 rounded-lg"
                                >
                                    <X size={16} />
                                    <span className="text-xs font-medium">Cancel</span>
                                </button>
                            </div>
                        </div>

                        {/* Video Player - Full screen */}
                        <div className="flex-1 flex items-center justify-center bg-black">
                            <ReactPlayer
                                url={activeVideo.url.startsWith('http') ? activeVideo.url : `${getServerUrl()}${activeVideo.url}`}
                                controls={false}
                                width="100%"
                                height="100%"
                                playing={true}
                                muted={false}
                                onStart={() => {
                                    // Start countdown exactly when video starts playing
                                    setCountdown(8);
                                }}
                                config={{
                                    file: {
                                        attributes: {
                                            style: { objectFit: 'contain', width: '100%', height: '100%' }
                                        }
                                    },
                                    youtube: {
                                        playerVars: {
                                            origin: window.location.origin,
                                            rel: 0,
                                            showinfo: 0,
                                            modestbranding: 1
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
