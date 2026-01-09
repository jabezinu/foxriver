import { ChevronLeft, MailOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Mail() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 pb-20 animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Message Center</h1>
            </div>

            <div className="px-4 py-6">
                <div className="text-center py-24 px-6">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                        <MailOpen className="text-zinc-600" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-300 mb-2">No messages yet</h3>
                    <p className="text-zinc-500 text-sm">We'll notify you when you receive new updates.</p>
                </div>
            </div>
        </div>
    );
}
