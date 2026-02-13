import { useState, useEffect } from 'react';
import { useAdminNewsStore } from '../store/newsStore';
import { toast } from 'react-hot-toast';
import { HiPlus, HiRefresh } from 'react-icons/hi';
import PageHeader from '../components/shared/PageHeader';
import NewsCard from '../components/NewsCard';
import NewsModal from '../components/NewsModal';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';

export default function News() {
    const { news, loading, fetchNews, createNews, updateNews, deleteNews } = useAdminNewsStore();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', showAsPopup: false, targetRanks: [] });
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchNews(); }, [fetchNews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = {
            title: formData.title,
            content: formData.content,
            showAsPopup: formData.showAsPopup,
            targetRanks: formData.targetRanks || []
        };

        const res = editingId 
            ? await updateNews(editingId, data)
            : await createNews(data);

        if (res.success) {
            toast.success(editingId ? 'Briefing Synchronized' : 'Global Broadcast Initiated');
            setShowModal(false);
            resetForm();
        } else {
            toast.error(res.message);
        }
        setSubmitting(false);
    };

    const confirmDelete = async () => {
        const res = await deleteNews(deleteId);
        if (res.success) {
            toast.success('Briefing Terminated');
        } else {
            toast.error(res.message);
        }
        setDeleteId(null);
    };

    const handleEdit = (newsItem) => {
        setFormData({
            title: newsItem.title,
            content: newsItem.content,
            showAsPopup: newsItem.showAsPopup || false,
            targetRanks: newsItem.targetRanks || []
        });
        setEditingId(newsItem._id || newsItem.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ title: '', content: '', showAsPopup: false, targetRanks: [] });
        setEditingId(null);
    };
    // ...


    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn space-y-8">
            <ConfirmModal
                isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete}
                title="Terminate Global Briefing"
                message="Are you certain you wish to purge this intelligence packet? This will permanently sever the broadcast signal for all agents."
                confirmText="Terminate Signal" isDangerous={true}
            />

            <PageHeader
                title="Intelligence Center"
                subtitle="Create and broadcast critical news packets to all network personnel."
                extra={
                    <div className="flex gap-3">
                        <button onClick={fetchNews} className="admin-btn-secondary flex items-center gap-2">
                            <HiRefresh /> Refresh Signals
                        </button>
                        <button onClick={() => { resetForm(); setShowModal(true); }} className="admin-btn-primary flex items-center gap-2">
                            <HiPlus /> Initiate Release
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {news.map((item) => (
                    <NewsCard
                        key={item._id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={setDeleteId}
                    />
                ))}
            </div>

            {news.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-300">
                    <p className="font-black uppercase tracking-[0.4em] text-[10px] mb-6">Signals Clear: No Active Intelligence Pkts</p>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="text-indigo-600 font-black text-xs uppercase hover:underline">
                        Initiate First Broadcast
                    </button>
                </div>
            )}

            <NewsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editingId={editingId}
                formData={formData}
                onChange={setFormData}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    );
}
