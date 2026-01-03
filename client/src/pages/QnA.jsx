import { useState, useEffect } from 'react';
import { qnaAPI } from '../services/api';
import { HiArrowLeft, HiPhotograph } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

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
                <h1 className="text-xl font-bold text-gray-900">Q & A Center</h1>
            </div>

            <div className="px-4 py-6">
                <div className="bg-blue-50 rounded-2xl p-4 mb-8 flex items-center gap-3 border border-blue-100">
                    <HiPhotograph className="text-2xl text-blue-500" />
                    <p className="text-[10px] font-bold text-blue-800 uppercase leading-snug">Visual guides for platform usage and task completion rules.</p>
                </div>

                {images.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">No help images found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {images.map((img) => (
                            <div key={img._id} className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
                                <img
                                    src={img.imageUrl.startsWith('http') ? img.imageUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${img.imageUrl}`}
                                    alt="Q&A Guide"
                                    className="w-full rounded-2xl block"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
