import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />
            <div className="bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden z-20 animate-slide-up relative flex flex-col border border-zinc-800">
                <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide text-sm">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto text-zinc-300">
                    {children}
                </div>
            </div>
        </div>
    );
}
