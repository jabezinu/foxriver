import React from 'react';
import { HiTrash, HiVideoCamera, HiCalendar, HiUser } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function TaskPool({ tasks, loading, onDelete, getYoutubeId }) {
    if (loading) {
        return (
            <div className="admin-card py-32 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Matrix...</p>
            </div>
        );
    }

    return (
        <Card noPadding className="overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Video Pool Content</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Videos available for daily selection</p>
                </div>
                <Badge variant="indigo" className="font-black">{tasks.length} Videos</Badge>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tasks.map((task) => (
                        <div key={String(task.id)} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
                            <div className="aspect-video bg-gray-900 overflow-hidden relative group-hover:bg-black transition-colors">
                                {task.videoUrl && (task.videoUrl.includes('youtube.com') || task.videoUrl.includes('youtu.be')) ? (
                                    <iframe
                                        className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                        src={`https://www.youtube.com/embed/${getYoutubeId(task.videoUrl)}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                        <HiVideoCamera className="text-4xl text-gray-700" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Internal Resource</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 flex justify-between items-start gap-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="gray" className="text-[9px] flex items-center gap-1">
                                            <HiCalendar /> {new Date(task.createdAt).toLocaleDateString()}
                                        </Badge>
                                        <span className="text-[10px] font-mono font-bold text-gray-400 tracking-tighter">
                                            #{String(task.id || task._id || '0000').slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700 truncate max-w-[180px]">
                                        {task.title || 'Untitled Protocol'}
                                    </p>
                                    {task.uploadedBy && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                            <HiUser className="text-gray-300" />
                                            <span>OP: {task.uploadedBy.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => onDelete(task.id)}
                                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                    ))}

                    {tasks.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                            <HiVideoCamera className="text-6xl mb-4 opacity-20" />
                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No Manual Tasks In Queue</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
