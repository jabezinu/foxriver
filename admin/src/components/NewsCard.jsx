import React from 'react';
import { HiPencil, HiTrash, HiCalendar, HiEye, HiNewspaper } from 'react-icons/hi';
import Card from './shared/Card';
import Badge from './shared/Badge';

export default function NewsCard({ item, onEdit, onDelete }) {
    return (
        <Card noPadding className="group overflow-hidden relative hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 border-l-4 border-l-transparent hover:border-l-indigo-600">
            {/* Action Buttons Overlay */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <button
                    onClick={() => onEdit(item)}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center shadow-lg border border-indigo-50 transition-all active:scale-95"
                    title="Edit Briefing"
                >
                    <HiPencil />
                </button>
                <button
                    onClick={() => onDelete(item._id)}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center shadow-lg border border-rose-50 transition-all active:scale-95"
                    title="Delete Briefing"
                >
                    <HiTrash />
                </button>
            </div>

            <div className="p-8">
                <div className="flex items-start gap-5">
                    {/* Icon Section */}
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl shadow-inner border border-indigo-100/50">
                        <HiNewspaper />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1 mb-3">
                            <div className="flex items-center gap-2">
                                <h4 className="text-lg font-bold text-gray-800 tracking-tight leading-tight truncate">{item.title}</h4>
                                {item.showAsPopup && (
                                    <Badge variant="indigo" className="px-2 py-0.5 text-[10px] animate-pulse">POPUP</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                                <span className="flex items-center gap-1">
                                    <HiCalendar className="text-indigo-400" />
                                    {new Date(item.publishedDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiEye className="text-indigo-400" />
                                    {item.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                            {item.content}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                                <Badge variant={item.status === 'active' ? 'green' : 'gray'}>
                                    {item.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Shine Effect */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </Card>
    );
}
