import { CheckCircle } from 'lucide-react';
import Button from './ui/Button';

export default function NewsPopup({ news, onClose, onNext, currentIndex = 0, totalCount = 1 }) {
    if (!news) return null;

    const hasMoreNews = currentIndex < totalCount - 1;

    const handleAction = () => {
        if (hasMoreNews) {
            onNext();
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
            <div className="bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg sm:mx-4 max-h-[75vh] sm:max-h-[85vh] mb-32 sm:mb-0 flex flex-col animate-slide-up shadow-2xl relative overflow-hidden border-t border-zinc-800 sm:border pointer-events-auto">
                {/* Header */}
                <div className="flex-shrink-0 p-4 sm:p-6 pb-0">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide border border-blue-500/20">
                                Official News
                            </span>
                            {totalCount > 1 && (
                                <span className="bg-zinc-800 text-zinc-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                    {currentIndex + 1} / {totalCount}
                                </span>
                            )}
                        </div>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-white mb-2 leading-tight">
                        {news.title}
                    </h2>
                    
                    <p className="text-[10px] text-zinc-500 font-bold mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle size={12} className="text-emerald-500" />
                        {new Date(news.publishedDate).toLocaleDateString()}
                    </p>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-3 sm:pb-4">
                    {news.imageUrl && (
                        <div className="mb-3">
                            <img 
                                src={news.imageUrl} 
                                alt={news.title}
                                className="w-full h-40 object-cover rounded-2xl border border-zinc-800"
                            />
                        </div>
                    )}

                    <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800">
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {news.content}
                        </p>
                    </div>
                </div>

                {/* Footer with button */}
                <div className="flex-shrink-0 p-4 sm:p-6 pt-0">
                    <Button
                        onClick={handleAction}
                        fullWidth
                        variant="secondary"
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
