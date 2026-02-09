import React from 'react';
import { HiPencil, HiTrash, HiNewspaper, HiCalendar, HiLightningBolt, HiEye } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function NewsCard({ item, onEdit, onDelete }) {
    return (
        <Card noPadding className="group overflow-hidden relative hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border-l-4 border-l-transparent hover:border-l-indigo-400 bg-zinc-900/50">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                    onClick={() => onEdit(item)}
                    className="w-10 h-10 rounded-xl bg-zinc-800/90 backdrop-blur-sm text-indigo-400 hover:bg-indigo-500 hover:text-white flex items-center justify-center shadow-lg border border-zinc-700 transition-all active:scale-95"
                    title="Edit Briefing"
                >
                    <HiPencil />
                </button>
                <button
                    onClick={() => onDelete(item.id || item._id)}
                    className="w-10 h-10 rounded-xl bg-zinc-800/90 backdrop-blur-sm text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-lg border border-zinc-700 transition-all active:scale-95"
                    title="Terminate Broadcast"
                >
                    <HiTrash />
                </button>
            </div>


            <div className="p-8">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-3xl shadow-inner border border-indigo-500/20">
                        <HiNewspaper />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors uppercase">{item.title}</h4>
                                {item.showAsPopup && (
                                    <Badge variant="blue" className="px-3 py-1 text-[9px] font-black animate-pulse bg-blue-500 text-white border-none shadow-[0_0_15px_rgba(59,130,246,0.5)]">POPUP ACTIVE</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-white">
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    <HiCalendar className="text-xl" />
                                    {new Date(item.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    <HiEye className="text-xl" />
                                    Global Broadcast
                                </div>
                            </div>
                        </div>

                        <p className="text-base text-slate-300 line-clamp-3 leading-relaxed font-medium">
                            {item.content}
                        </p>

                        <div className="pt-6 flex items-center justify-between border-t border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Integrity</span>
                                <Badge variant={item.status === 'active' ? 'green' : 'gray'} className="font-black text-[10px] px-4 py-1 bg-emerald-500 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    {item.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-indigo-500/40"></div>
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
