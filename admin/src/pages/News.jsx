import { useState, useEffect } from 'react';
import { adminNewsAPI } from '../services/api';
import { HiPlus, HiTrash, HiPhotograph, HiCheck } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import ConfirmModal from '../components/ConfirmModal';

export default function NewsManagement() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await adminNewsAPI.getNews();
            setNews(res.data.news);
        } catch (error) {
            toast.error('Failed to load news');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return;

        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        if (imageFile) data.append('image', imageFile);

        setSubmitting(true);
        try {
            await adminNewsAPI.create(data);
            toast.success('News broadcasted successfully!');
            setFormData({ title: '', content: '' });
            setImageFile(null);
            fetchNews();
        } catch (error) {
            toast.error('Failed to post news');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await adminNewsAPI.delete(deleteId);
            toast.success('News post deleted');
            fetchNews();
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Intelligence"
                message="Are you sure you want to delete this news post? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Intelligence Feed</h1>
                    <p className="text-sm text-gray-500">Publish company updates and official field news.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Create Broadcast</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                type="text" placeholder="Intelligence Title" className="admin-input"
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Intelligence Content" className="admin-input min-h-[150px]"
                                value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                            <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-gray-50">
                                <input
                                    type="file" id="news-img" className="hidden"
                                    onChange={e => setImageFile(e.target.files[0])}
                                />
                                <label htmlFor="news-img" className="flex items-center gap-3 cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-400 border border-gray-100">
                                        {imageFile ? <HiCheck className="text-green-500" /> : <HiPhotograph />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                                        {imageFile ? imageFile.name : 'Add Cover Image'}
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit" disabled={submitting}
                                className="admin-btn-primary w-full py-4 tracking-widest text-xs font-bold uppercase"
                            >
                                {submitting ? 'Transmitting...' : 'Post Intelligence'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Published Intelligence ({news.length})</h3>
                        {loading ? (
                            <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Scanning History...</div>
                        ) : (
                            <div className="space-y-4">
                                {news.map((item) => (
                                    <div key={item._id} className="p-4 bg-gray-50 rounded-2xl flex gap-4 items-start border border-gray-100">
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${item.imageUrl}`}
                                                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-800 truncate">{item.title}</h4>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap ml-2">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <HiTrash className="text-xl" />
                                        </button>
                                    </div>
                                ))}
                                {news.length === 0 && (
                                    <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">History is clear</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
