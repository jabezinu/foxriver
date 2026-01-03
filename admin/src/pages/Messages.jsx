import { useState, useEffect } from 'react';
import { adminMessageAPI } from '../services/api';
import { HiMail, HiUsers, HiLightningBolt, HiMailOpen } from 'react-icons/hi';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', isBroadcast: true });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await adminMessageAPI.getAll();
            setMessages(res.data.messages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminMessageAPI.send(formData);
            alert('Satellite broadcast successful!');
            setFormData({ title: '', content: '', isBroadcast: true });
            fetchMessages();
        } catch (error) {
            alert('Transmission failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Communication Relay</h1>
                    <p className="text-sm text-gray-500">Dispatch orbital broadcasts and system alerts to all operatives.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Send Box */}
                <div className="admin-card h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                            <HiLightningBolt />
                        </div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest leading-none">Emergency Broadcast</h3>
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
                            className="admin-btn-primary w-full py-4 tracking-[0.2em] text-xs font-bold uppercase shadow-lg shadow-indigo-200"
                        >
                            {submitting ? 'Transmitting Data...' : 'Initiate Broadcast'}
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
                                <div key={msg._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-400 border border-gray-100 shadow-sm">
                                                <HiMailOpen />
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-sm">{msg.title}</h4>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(msg.createdAt).toLocaleDateString()}</span>
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
