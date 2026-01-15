import React from 'react';
import { HiVideoCamera, HiPencil, HiTrash, HiLink, HiBadgeCheck } from 'react-icons/hi';

export default function CourseItem({ course, onEdit, onDelete }) {
    return (
        <div className="p-6 rounded-3xl border border-gray-100 bg-white hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 group">
            <div className="flex justify-between items-start gap-6">
                <div className="flex items-start gap-5 flex-1">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-inner border border-emerald-100/50 group-hover:rotate-12 transition-transform duration-500">
                        <HiVideoCamera />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-gray-800 uppercase tracking-tight truncate group-hover:text-emerald-600 transition-colors">{course.title}</h4>
                            <HiBadgeCheck className="text-emerald-500 shrink-0" />
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Category</span>
                                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                    {course.categoryDetails?.name || 'GENERIC'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <HiLink className="text-blue-400 shrink-0" />
                                <span className="text-[9px] font-bold text-blue-500 truncate uppercase tracking-tighter cursor-pointer hover:underline">
                                    {course.videoUrl}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(course)}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                    >
                        <HiPencil />
                    </button>
                    <button
                        onClick={() => onDelete(course.id)}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                    >
                        <HiTrash />
                    </button>
                </div>
            </div>
        </div>
    );
}
