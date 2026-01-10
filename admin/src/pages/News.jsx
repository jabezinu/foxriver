import { useState, useEffect } from 'react';
import { adminNewsAPI } from '../services/api';
import { HiNewspaper, HiCalendar, HiTrash, HiPencil, HiX, HiPlus } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import ConfirmModal from '../components/ConfirmModal';

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', showAsPopup: false });
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await adminNewsAPI.getAll();
            setNews(res.data.news);
        } catch (error) {
            toast.error('Failed to load news');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await adminNewsAPI.update(editingId, formData);
                toast.success('News updated successfully!');
            } else {
                await adminNewsAPI.create(formData);
                toast.success('News created successfully!');
            }

            resetForm();
            fetchNews();
            setShowForm(false);
        } catch (error) {
            toast.error('Operation failed');
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
            toast.success('News deleted');
            fetchNews();
            if (editingId === deleteId) resetForm();
        } catch (error) {
            toast.error('Deletion failed');
        } finally {
            setDeleteId(null);
        }
    };

    const handleEdit = (newsItem) => {
        setFormData({
            title: newsItem.title,
            content: newsItem.content,
            showAsPopup: newsItem.showAsPopup || false
        });
        setEditingId(newsItem._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ title: '', content: '', showAsPopup: false });
        setEditingId(null);
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete News"
                message="Are you sure you want to delete this news? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
                    <p className="text-sm text-gray-500">Create and manage news announcements for all users.</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); resetForm(); }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <HiPlus />
                    Create News
                </button>
            </div>

            {/* News Form */}
            {showForm && (
                <div className="admin-card mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingId ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                                {editingId ? <HiPencil /> : <HiNewspaper />}
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest leading-none">
                                {editingId ? 'Edit News' : 'Create News'}
                            </h3>
                        </div>
                        <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                            <HiX className="text-xl" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text" placeholder="News Title" className="admin-input"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="News content..." className="admin-input min-h-[200px]"
                            value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <input
                                type="checkbox"
                                id="showAsPopup"
                                checked={formData.showAsPopup}
                                onChange={e => setFormData({ ...formData, showAsPopup: e.target.checked })}
                                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="showAsPopup" className="text-sm font-bold text-gray-700 cursor-pointer">
                                Show as popup notification when users sign in
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit" disabled={submitting}
                                className={`flex-1 py-4 tracking-[0.2em] text-xs font-bold uppercase shadow-lg transition-all rounded-xl text-white ${editingId ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}`}
                            >
                                {submitting ? 'Processing...' : (editingId ? 'Update News' : 'Create News')}
                            </button>
                            <button
                                type="button" onClick={() => { setShowForm(false); resetForm(); }}
                                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* News List */}
            <div className="admin-card">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Published News ({news.length})</h3>
                {loading ? (
                    <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading...</div>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {news.map((item) => (
                            <div key={item._id} className={`p-4 rounded-2xl border relative group transition-all hover:shadow-md ${editingId === item._id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-400 border border-gray-100 shadow-sm">
                                            <HiNewspaper />
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase mr-2">
                                            <HiCalendar className="inline mr-1" />
                                            {new Date(item.publishedDate).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                            <HiPencil className="text-lg" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <HiTrash className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{item.content}</p>
                                <div className="mt-3 flex gap-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[8px] font-bold text-gray-400 uppercase">Status:</span>
                                        <span className={`text-[10px] font-bold ${item.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    {item.showAsPopup && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-[8px] font-bold text-blue-400 uppercase">Popup:</span>
                                            <span className="text-[10px] font-bold text-blue-600">
                                                Enabled
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {news.length === 0 && (
                            <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No news found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
