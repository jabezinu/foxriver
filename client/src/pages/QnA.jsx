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
        <div className="min-h-screen bg-zinc-950 pb-20 animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Q & A Center</h1>
            </div>

            <div className="px-4 py-6">
                <Card className="bg-primary-500/10 rounded-2xl p-5 mb-8 flex items-center gap-4 border-primary-500/20 shadow-none">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500 flex-shrink-0">
                        <ImageIcon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm mb-1">Visual Assistance</h3>
                        <p className="text-[10px] font-medium text-zinc-400 leading-relaxed">Visual guides for platform usage, task completion rules, and important tutorials.</p>
                    </div>
                </Card>

                {images.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800 mx-2">
                        <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                            <ImageIcon className="text-zinc-600" size={24} />
                        </div>
                        <p className="text-zinc-500 font-medium">No help images found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {images.map((img) => {
                            const imageUrl = img.imageUrl || '';
                            const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5002';
                            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
                            
                            return (
                                <Card key={img.id || img._id} className="p-2 overflow-hidden hover:shadow-glow transition-all duration-300 border-zinc-800 bg-zinc-900">
                                    <div className="relative rounded-2xl overflow-hidden bg-zinc-950">
                                        <img
                                            src={fullImageUrl}
                                            alt="Q&A Guide"
                                            loading="lazy"
                                            className="w-full h-auto block"
                                        />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
