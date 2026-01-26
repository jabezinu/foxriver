import React from 'react';
import { HiX, HiDownload } from 'react-icons/hi';

export default function ScreenshotModal({ isOpen, src, onClose }) {
    if (!isOpen || !src) return null;

    return (
        <div
            className="fixed inset-0 bg-indigo-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <a
                        href={src}
                        download
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-indigo-600 transition-all border border-white/30"
                        title="Download Evidence"
                    >
                        <HiDownload className="text-xl" />
                    </a>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-lg"
                    >
                        <HiX className="text-xl" />
                    </button>
                </div>

                <div className="bg-gray-50 flex items-center justify-center h-[70vh] overflow-hidden p-4">
                    <img
                        src={src}
                        alt="Transaction Evidence"
                        className="max-w-full max-h-full rounded-xl object-contain shadow-sm border border-gray-100 animate-zoomIn"
                    />
                </div>

                <div className="px-8 py-5 bg-white border-t border-gray-50 flex justify-between items-center">
                    <div>
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Transaction Evidence Matrix</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Verified digital artifact from personnel device</p>
                    </div>
                    <Badge variant="indigo" className="font-black">ENCRYPTED SIGNAL</Badge>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, variant, className = "" }) {
    const variants = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        gray: "bg-gray-50 text-gray-600 border-gray-100"
    };
    return (
        <span className={`px-3 py-1 rounded-lg border text-[9px] uppercase font-black tracking-widest ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
