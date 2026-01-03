import { useState, useEffect } from 'react';
import { messageAPI } from '../services/api';
import { HiArrowLeft, HiMail, HiMailOpen, HiCheckCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

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
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-800">
                    <HiArrowLeft />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Message Center</h1>
            </div>

            <div className="p-4">
                {messages.length === 0 ? (
                    <div className="text-center py-20">
                        <HiMailOpen className="text-6xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">Your inbox is empty</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                onClick={() => handleRead(msg)}
                                className={`card flex gap-4 items-start transition-all ${!msg.isRead ? 'border-l-4 border-l-green-500' : 'opacity-70'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl ${!msg.isRead ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {msg.isRead ? <HiMailOpen className="text-xl" /> : <HiMail className="text-xl" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-bold ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {msg.title}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap ml-2">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Message View Overlay */}
            {activeMessage && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slideUp">
                        <div className="flex justify-between items-center mb-6">
                            <span className="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Official Message</span>
                            <button onClick={() => setActiveMessage(null)} className="text-gray-400 text-2xl font-bold">×</button>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">{activeMessage.title}</h2>
                        <p className="text-[10px] text-gray-400 font-bold mb-6 flex items-center gap-1 uppercase">
                            <HiCheckCircle />
                            Received on {new Date(activeMessage.createdAt).toLocaleString()}
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{activeMessage.content}</p>
                        </div>

                        <button
                            onClick={() => setActiveMessage(null)}
                            className="btn-primary w-full py-4 tracking-widest text-xs font-bold uppercase"
                        >
                            Mark Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
