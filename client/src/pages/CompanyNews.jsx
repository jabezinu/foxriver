import { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Newspaper, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';

export default function CompanyNews() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await newsAPI.getNews();
            setNews(res.data.news);
        } catch (error) {
            toast.error('Failed to load news updates');
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
                <h1 className="text-xl font-bold text-white">Company News</h1>
            </div>

            <div className="px-4 py-6 space-y-6">
                {news.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                            <Newspaper className="text-zinc-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-300 mb-2">No updates yet</h3>
                        <p className="text-zinc-500 text-sm">Check back later for latest news.</p>
                    </div>
                ) : (
                    news.map((item) => (
                        <Card key={item._id} className="overflow-hidden flex flex-col p-0 border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
                            {item.imageUrl && (
                                <div className="w-full aspect-video relative bg-zinc-800">
                                    <img
                                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${item.imageUrl}`}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-primary-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
                                        Official Update
                                    </div>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wide mb-3">
                                    <Calendar size={14} className="text-primary-500" />
                                    {new Date(item.publishedDate).toLocaleDateString()}
                                </div>
                                <h2 className="text-xl font-black text-white mb-4 leading-tight">{item.title}</h2>
                                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">{item.content}</p>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
