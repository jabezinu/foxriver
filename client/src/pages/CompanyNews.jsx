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
        <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Company News</h1>
            </div>

            <div className="px-4 py-6 space-y-6">
                {news.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Newspaper className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No updates yet</h3>
                        <p className="text-gray-400 text-sm">Check back later for latest news.</p>
                    </div>
                ) : (
                    news.map((item) => (
                        <Card key={item._id} className="overflow-hidden flex flex-col p-0 border-gray-100">
                            {item.imageUrl && (
                                <div className="w-full aspect-video relative bg-gray-100">
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
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-3">
                                    <Calendar size={14} className="text-emerald-500" />
                                    {new Date(item.publishedDate).toLocaleDateString()}
                                </div>
                                <h2 className="text-xl font-black text-gray-900 mb-4 leading-tight">{item.title}</h2>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">{item.content}</p>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
