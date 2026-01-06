import { useState, useEffect } from 'react';
import { messageAPI } from '../services/api';
import { ChevronLeft, Mail as MailIcon, MailOpen, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Mail() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMessage, setActiveMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await messageAPI.getUserMessages();
            setMessages(res.data.messages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (msg) => {
        setActiveMessage(msg);
        if (!msg.isRead) {
            try {
                await messageAPI.markAsRead(msg._id);
                fetchMessages();
            } catch (error) {
                console.error(error);
            }
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
                <h1 className="text-xl font-bold text-gray-900">Message Center</h1>
            </div>

            <div className="px-4 py-6">
                {messages.length === 0 ? (
                    <div className="text-center py-24 px-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MailOpen className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-400 text-sm">We'll notify you when you receive new updates.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg) => (
                            <Card
                                key={msg._id}
                                onClick={() => handleRead(msg)}
                                className={`flex gap-4 items-start p-4 cursor-pointer hover:shadow-md transition-all border-l-4 ${!msg.isRead ? 'border-l-primary-500 bg-white' : 'border-l-transparent bg-gray-50/50 opacity-80'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl flex-shrink-0 ${!msg.isRead ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {msg.isRead ? <MailOpen size={20} /> : <MailIcon size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-bold truncate pr-2 ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {msg.title}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap flex-shrink-0">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{msg.content}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Message View Overlay */}
            {activeMessage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={() => setActiveMessage(null)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-primary-100 text-primary-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">Official Message</span>
                        </div>

                        <h2 className="text-xl font-black text-gray-900 mb-3 pr-8 leading-tight">{activeMessage.title}</h2>
                        <p className="text-[11px] text-gray-400 font-bold mb-6 flex items-center gap-1.5 uppercase tracking-wide">
                            <CheckCircle size={14} className="text-emerald-500" />
                            Received on {new Date(activeMessage.createdAt).toLocaleString()}
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-5 mb-6 max-h-[60vh] overflow-y-auto border border-gray-100">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{activeMessage.content}</p>
                        </div>

                        <Button
                            onClick={() => setActiveMessage(null)}
                            fullWidth
                            variant="secondary"
                        >
                            Back to Inbox
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
