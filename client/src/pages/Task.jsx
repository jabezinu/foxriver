import { useState, useEffect } from 'react';
import { taskAPI, userAPI } from '../services/api';
import { HiPlay, HiCheckCircle, HiVideoCamera } from 'react-icons/hi';
import ReactPlayer from 'react-player';
import Loading from '../components/Loading';

export default function Task() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyStats, setDailyStats] = useState({ dailyIncome: 0, perVideoIncome: 0 });
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

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

    const handleCompleteTask = async (taskId) => {
        try {
            const response = await taskAPI.completeTask(taskId);
            if (response.data.success) {
                alert(`Task completed! Earned ${response.data.earningsAmount} ETB`);
                fetchTasks();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to complete task');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn px-4 py-6">
            {/* Header Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 flex justify-between items-center border border-gray-50">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Daily Potential</p>
                    <h2 className="text-2xl font-bold text-gray-900">{dailyStats.dailyIncome} ETB</h2>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Per Video</p>
                    <p className="text-xl font-bold text-green-600">{dailyStats.perVideoIncome} ETB</p>
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
                        <div key={task._id} className="card relative overflow-hidden">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center relative group cursor-pointer"
                                    onClick={() => setActiveVideo(task.videoUrl)}
                                >
                                    <HiPlay className="text-gray-400 text-3xl group-hover:text-green-500 transition-colors" />
                                </div>

                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 mb-1">Video Task #{task._id.slice(-4)}</p>
                                    <p className="text-xs font-semibold text-green-600">Earnings: {task.earnings} ETB</p>
                                </div>

                                <div>
                                    {task.isCompleted ? (
                                        <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-3 py-2 rounded-xl">
                                            <HiCheckCircle className="text-lg" />
                                            DONE
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleCompleteTask(task._id)}
                                            className="btn-primary py-2 px-4 text-xs"
                                        >
                                            CLAIM
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
                <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4">
                    <button
                        onClick={() => setActiveVideo(null)}
                        className="absolute top-6 right-6 text-white text-3xl font-bold"
                    >
                        ×
                    </button>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
                        <ReactPlayer
                            url={activeVideo.startsWith('http') ? activeVideo : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeVideo}`}
                            controls
                            width="100%"
                            height="100%"
                            playing
                        />
                    </div>
                    <p className="text-white/60 text-sm mt-6">Watch the full video to complete the task</p>
                </div>
            )}
        </div>
    );
}
