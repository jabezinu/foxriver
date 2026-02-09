import { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import { ChevronLeft, MailOpen, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function CompanyNews() {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNews, setActiveNews] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await newsAPI.getNews();
            setNews(res.data.news);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

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
                <h1 className="text-xl font-bold text-white">News</h1>
            </div>

            <div className="px-4 py-6">
                {news.length === 0 ? (
                    <div className="text-center py-24 px-6">
                        <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-zinc-800 shadow-xl">
                            <MailOpen className="text-zinc-700" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">No updates found</h3>
                        <p className="text-zinc-500 text-sm font-medium">We'll notify you as soon as new intelligence is broadcast.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {news.map((item) => (
                            <Card
                                key={item._id}
                                onClick={() => setActiveNews(item)}
                                className="flex gap-5 items-start p-6 cursor-pointer hover:bg-zinc-800 transition-all border-l-4 border-l-transparent bg-zinc-900 shadow-2xl border-white/5 hover:border-l-violet-400 hover:scale-[1.02]"
                            >
                                <div className="p-5 rounded-2xl flex-shrink-0 bg-violet-500/10 text-violet-400 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                                    <MailOpen size={28} />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex justify-between items-start mb-2.5">
                                        <h3 className="text-lg font-black truncate pr-2 text-white uppercase tracking-tight">
                                            {item.title}
                                        </h3>
                                        <span className="text-[10px] text-violet-400 font-black whitespace-nowrap flex-shrink-0 bg-violet-500/10 px-3 py-1.5 rounded-xl border border-violet-500/20 shadow-glow">
                                            {new Date(item.publishedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed font-medium">{item.content}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* News View Overlay */}
            {activeNews && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-zinc-900 rounded-[2.5rem] w-full max-w-md p-8 animate-slide-up shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden border border-zinc-800">
                        <div className="absolute top-0 right-0 p-6">
                            <button onClick={() => setActiveNews(null)} className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all shadow-lg active:scale-95">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-8">
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-500/30">Intelligence Briefing</span>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-4 pr-10 leading-tight uppercase tracking-tight">{activeNews.title}</h2>
                        <p className="text-[11px] text-zinc-500 font-black mb-8 flex items-center gap-2 uppercase tracking-widest bg-zinc-950/50 w-fit px-3 py-1.5 rounded-xl border border-zinc-800/50">
                            <CheckCircle size={14} className="text-emerald-500" />
                            Authenticated on {new Date(activeNews.publishedDate).toLocaleString()}
                        </p>


                        <div className="bg-zinc-950 rounded-3xl p-6 mb-8 max-h-[50vh] overflow-y-auto border border-zinc-800 shadow-inner">
                            <p className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap font-medium">{activeNews.content}</p>
                        </div>

                        <Button
                            onClick={() => setActiveNews(null)}
                            fullWidth
                            variant="secondary"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-2xl border border-zinc-700 shadow-lg transition-all active:scale-95 uppercase tracking-widest"
                        >
                            Decommission
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
