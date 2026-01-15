import React from 'react';
import { HiTrash, HiEye, HiOutlinePhotograph } from 'react-icons/hi';
import { getServerUrl } from '../config/api.config';

export default function QnaVisualCard({ img, onDelete }) {
    const imageUrl = img.imageUrl || '';
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${getServerUrl()}${imageUrl}`;

    return (
        <div className="relative group rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-4">
                <img
                    src={fullImageUrl}
                    alt="Instructional Visual"
                    className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-700"
                />
            </div>

            <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                <div className="flex gap-3">
                    <button
                        onClick={() => onDelete(img.id || img._id)}
                        className="w-14 h-14 bg-white/10 hover:bg-rose-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl hover:shadow-rose-500/30 border border-white/20 active:scale-95"
                        title="Decommission Visual"
                    >
                        <HiTrash className="text-2xl" />
                    </button>
                    <a
                        href={fullImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-14 h-14 bg-white/10 hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl hover:shadow-indigo-500/30 border border-white/20 active:scale-95"
                        title="Inspect Signal"
                    >
                        <HiEye className="text-2xl" />
                    </a>
                </div>
                <div className="text-center px-4">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-0.5">Instructional Payload</p>
                    <p className="text-[8px] text-indigo-300 font-bold uppercase tracking-widest">{img.id || img._id}</p>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HiOutlinePhotograph className="text-indigo-400" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Visual Node</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Verified Artifact</span>
            </div>
        </div>
    );
}
