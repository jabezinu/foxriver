import { useState, useEffect } from 'react';
import { qnaAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';

export default function QnA() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await qnaAPI.getQnA();
            setImages(res.data.qna);
        } catch (error) {
            toast.error('Failed to load Q&A guides');
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
                <h1 className="text-xl font-bold text-gray-900">Q & A Center</h1>
            </div>

            <div className="px-4 py-6">
                <Card className="bg-blue-50/50 rounded-2xl p-5 mb-8 flex items-center gap-4 border-blue-100 shadow-none">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <ImageIcon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-sm mb-1">Visual Assistance</h3>
                        <p className="text-[10px] font-medium text-blue-700/80 leading-relaxed">Visual guides for platform usage, task completion rules, and important tutorials.</p>
                    </div>
                </Card>

                {images.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 mx-2">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="text-gray-300" size={24} />
                        </div>
                        <p className="text-gray-400 font-medium">No help images found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {images.map((img) => (
                            <Card key={img._id} className="p-2 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                                    <img
                                        src={img.imageUrl.startsWith('http') ? img.imageUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${img.imageUrl}`}
                                        alt="Q&A Guide"
                                        loading="lazy"
                                        className="w-full h-auto block"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
