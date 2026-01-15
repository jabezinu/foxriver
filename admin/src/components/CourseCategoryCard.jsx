import React from 'react';
import { HiFolder, HiPencil, HiTrash, HiSparkles } from 'react-icons/hi';

export default function CourseCategoryCard({ category, onEdit, onDelete }) {
    return (
        <div className="p-6 rounded-3xl border border-gray-100 bg-white hover:bg-indigo-50/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>

            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-inner border border-indigo-100/50 group-hover:scale-110 transition-transform duration-500">
                        <HiFolder />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{category.name}</h4>
                        {category.description && (
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5 line-clamp-1">{category.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => onEdit(category)}
                        className="w-9 h-9 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center shadow-lg border border-indigo-50 transition-all active:scale-95"
                    >
                        <HiPencil />
                    </button>
                    <button
                        onClick={() => onDelete(category.id)}
                        className="w-9 h-9 rounded-xl bg-white text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center shadow-lg border border-rose-50 transition-all active:scale-95"
                    >
                        <HiTrash />
                    </button>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
                <HiSparkles className="text-xs text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Academic Category Node</span>
            </div>
        </div>
    );
}
