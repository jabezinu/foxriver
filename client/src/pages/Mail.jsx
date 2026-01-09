import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';

export default function Mail() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        initializeChat();
    }, []);

    const initializeChat = async () => {
        try {
            // Get or create chat
            const chatRes = await chatAPI.getChat();
            const chatData = chatRes.data.chat;
            setChat(chatData);

            // Get messages
            const messagesRes = await chatAPI.getMessages(chatData._id);
            setMessages(messagesRes.data.messages);
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat || sending) return;

        setSending(true);
        try {
            const res = await chatAPI.sendMessage(chat._id, newMessage.trim());
            setMessages(prev => [...prev, res.data.message]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-20 animate-fade-in flex flex-col">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Support Chat</h1>
                        <p className="text-xs text-zinc-400">Admin Team</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 ? (
                    <div className="text-center py-24 px-6">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                            <Bot className="text-zinc-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-300 mb-2">Start a conversation</h3>
                        <p className="text-zinc-500 text-sm">Send us a message and we'll respond as soon as possible.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => {
                            const isAdmin = message.sender.role === 'admin';
                            const isOwn = message.sender._id === user?.id;
                            
                            return (
                                <div
                                    key={message._id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                >
                                    <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isAdmin ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-zinc-800'
                                        }`}>
                                            {isAdmin ? (
                                                <Bot className="text-white" size={16} />
                                            ) : (
                                                <User className="text-zinc-400" size={16} />
                                            )}
                                        </div>
                                        <div className={`rounded-2xl px-4 py-2 ${
                                            isOwn 
                                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                                : isAdmin 
                                                    ? 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700'
                                                    : 'bg-zinc-900 text-zinc-300 rounded-bl-sm border border-zinc-800'
                                        }`}>
                                            <p className="text-sm leading-relaxed break-words">{message.content}</p>
                                            <p className={`text-[10px] mt-1 ${
                                                isOwn ? 'text-blue-200' : 'text-zinc-500'
                                            }`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 px-4 py-3">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-full p-3 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
