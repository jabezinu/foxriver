import { useState, useEffect } from 'react';
import { adminMessageAPI } from '../services/api';
import { HiMail, HiUsers, HiLightningBolt, HiMailOpen, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import ConfirmModal from '../components/ConfirmModal';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', isBroadcast: true });
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await adminMessageAPI.getAll();
            setMessages(res.data.messages);
        } catch (error) {
            toast.error('Failed to load communication history');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await adminMessageAPI.update(editingId, formData);
                toast.success('Broadcast updated successfully!');
            } else {
                await adminMessageAPI.send(formData);
                toast.success('Satellite broadcast successful!');
            }

            resetForm();
            fetchMessages();
        } catch (error) {
            toast.error('Transmission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await adminMessageAPI.delete(deleteId);
            toast.success('Broadcast deleted');
            fetchMessages();
            if (editingId === deleteId) resetForm();
        } catch (error) {
            toast.error('Deletion failed');
        } finally {
            setDeleteId(null);
        }
    };

    const handleEdit = (msg) => {
        setFormData({
            title: msg.title,
            content: msg.content,
            isBroadcast: msg.isBroadcast
        });
        setEditingId(msg._id);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ title: '', content: '', isBroadcast: true });
        setEditingId(null);
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Broadcast"
                message="Are you sure you want to delete this broadcast? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Communication Relay</h1>
                    <p className="text-sm text-gray-500">Dispatch orbital broadcasts and system alerts to all operatives.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Send/Edit Box */}
                <div className="admin-card h-fit sticky top-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingId ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                {editingId ? <HiPencil /> : <HiLightningBolt />}
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest leading-none">
                                {editingId ? 'Edit Broadcast' : 'Emergency Broadcast'}
                            </h3>
                        </div>
                        {editingId && (
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <HiX className="text-xl" />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="space-y-4">
                        <input
                            type="text" placeholder="Direct Alert Title" className="admin-input"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Detailed operative instructions..." className="admin-input min-h-[200px]"
                            value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <HiUsers className="text-orange-500 text-xl" />
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-orange-800 uppercase">Priority Protocol</p>
                                <p className="text-[8px] text-orange-600 font-bold uppercase tracking-widest">Transmitting to all REGISTERED users globally</p>
                            </div>
                        </div>
                        <button
                            type="submit" disabled={submitting}
                            className={`w-full py-4 tracking-[0.2em] text-xs font-bold uppercase shadow-lg transition-all rounded-xl text-white ${editingId ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'}`}
                        >
                            {submitting ? 'Processing...' : (editingId ? 'Update Signal' : 'Initiate Broadcast')}
                        </button>
                    </form>
                </div>

                {/* History Box */}
                <div className="admin-card">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Signal History ({messages.length})</h3>
                    {loading ? (
                        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Scanning Waves...</div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {messages.map((msg) => (
                                <div key={msg._id} className={`p-4 rounded-2xl border relative group transition-all hover:shadow-md ${editingId === msg._id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-400 border border-gray-100 shadow-sm">
                                                <HiMailOpen />
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-sm">{msg.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase mr-2">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                            <button
                                                onClick={() => handleEdit(msg)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <HiPencil className="text-lg" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(msg._id)}
                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <HiTrash className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{msg.content}</p>
                                    <div className="mt-3 flex gap-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">Signals Confirmed:</span>
                                            <span className="text-[10px] text-indigo-600 font-bold">{msg.recipients?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No historical broadcasts found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
