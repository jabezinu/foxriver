import { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiArrowLeft, HiNewspaper, HiCalendar } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

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
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-800">
                    <HiArrowLeft />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Company News</h1>
            </div>

            <div className="px-4 py-6 space-y-6">
                {news.length === 0 ? (
                    <div className="text-center py-20">
                        <HiNewspaper className="text-6xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">No news updates available.</p>
                    </div>
                ) : (
                    news.map((item) => (
                        <div key={item._id} className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-50 flex flex-col">
                            {item.imageUrl && (
                                <div className="w-full aspect-video relative">
                                    <img
                                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${item.imageUrl}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                        Official
                                    </div>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase mb-3">
                                    <HiCalendar className="text-lg text-green-500" />
                                    {new Date(item.publishedDate).toLocaleDateString()}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{item.title}</h2>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
