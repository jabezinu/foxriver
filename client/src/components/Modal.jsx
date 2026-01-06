import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden z-10 animate-slide-up relative flex flex-col">
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
