import React from 'react';
import { HiPencil, HiTrash, HiNewspaper, HiCalendar, HiLightningBolt, HiEye } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function NewsCard({ item, onEdit, onDelete }) {
    return (
        <Card noPadding className="group overflow-hidden relative hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 border-l-4 border-l-transparent hover:border-l-indigo-600">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                    onClick={() => onEdit(item)}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center shadow-lg border border-indigo-50 transition-all active:scale-95"
                    title="Edit Briefing"
                >
                    <HiPencil />
                </button>
                <button
                    onClick={() => onDelete(item.id || item._id)}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center shadow-lg border border-rose-50 transition-all active:scale-95"
                    title="Terminate Broadcast"
                >
                    <HiTrash />
                </button>
            </div>

            <div className="p-8">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl shadow-inner border border-indigo-100/50">
                        <HiNewspaper />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-lg font-black text-gray-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase">{item.title}</h4>
                                {item.showAsPopup && (
                                    <Badge variant="blue" className="px-2 py-0.5 text-[8px] font-black animate-pulse">POPUP ACTIVE</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <HiCalendar className="text-indigo-400" />
                                    {new Date(item.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <HiEye className="text-indigo-400" />
                                    Global Broadcast
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
                            {item.content}
                        </p>

                        <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Signal Integrity</span>
                                <Badge variant={item.status === 'active' ? 'green' : 'gray'} className="font-black text-[9px] px-3">
                                    {item.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
